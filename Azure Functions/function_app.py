import logging
import requests
import azure.functions as func
from config import API_KEY

app = func.FunctionApp()

@app.function_name(name="SummarizeText")
@app.route(route="summarize", methods=["POST", "OPTIONS"]) # HTTP Trigger
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing request for summarization.')

    if req.method == "OPTIONS":
        return func.HttpResponse(
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

    try:
        # Parse JSON request body
        req_body = req.get_json()
        conversation = req_body.get('conversation')

        if not conversation:
            return func.HttpResponse(
                "Please provide a conversation text.",
                status_code=400,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )

        # OpenAI deployment details
        endpoint = "https://ericsummarysi.openai.azure.com/"
        deployment_name = "gpt-4"
        api_key = API_KEY
        api_version = "2024-08-01-preview"

        # GPT-4 endpoint
        url = f"{endpoint}openai/deployments/{deployment_name}/chat/completions?api-version={api_version}"
        headers = {
            "Content-Type": "application/json",
            "api-key": api_key
        }

        # Payload for GPT
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes conversations."
                },
                {
                    "role": "user",
                    "content": f"Summarize the following text:\n\n{conversation}"
                }
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }

        # Send request to GPT
        logging.info(f"Sending request to URL: {url}")
        logging.info(f"Request headers: {headers}")
        logging.info(f"Request payload: {payload}")

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        summary = response.json()

        logging.info(f"Response received: {summary}")

        # Check and return the summary
        if "choices" in summary and len(summary["choices"]) > 0 and "message" in summary["choices"][0]:
            return func.HttpResponse(
                f"Summary: {summary['choices'][0]['message']['content']}",
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )
        else:
            logging.error("Unexpected response format: %s", summary)
            return func.HttpResponse(
                "Failed to generate summary due to unexpected response format.",
                status_code=500,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            )        

    except ValueError:
        return func.HttpResponse(
            "Invalid JSON in request body.",
            status_code=400,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
    except requests.exceptions.RequestException as e:
        logging.error("Error communicating with GPT model: %s", str(e))
        return func.HttpResponse(
            "Error communicating with GPT model.",
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )