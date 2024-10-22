import React from 'react'

function Header() {
  return (
    <div>
        <div className='flex justify-between items-center shadow-md p-3'>
    

        <ul className='hidden md:flex gap-16'>
          <Link to={'/'}>
          <li className='font-medium text-black hover:scale-105 transition-all cursor-pointer hover:text-primary'>Home</li>
          </Link>
          <li className='font-medium text-black hover:scale-105 transition-all cursor-pointer hover:text-primary'>Search</li>
          <li className='font-medium text-black hover:scale-105 transition-all cursor-pointer hover:text-primary'>About</li>
          <li className='font-medium text-black hover:scale-105 transition-all cursor-pointer hover:text-primary'>Contact</li>
        </ul>
    

    </div>
    </div>

  )
}

export default Header