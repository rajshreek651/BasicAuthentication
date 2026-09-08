import React from 'react'
import NavBarComponent from '@/Components/Navbar'

export default function UserLayout({children}) {
  return (
    <div>
        {
            // Here we will embed those things that we want to be present in all the pages, like the header, footer, etc.
            // The components embedded here, will be reflected in all those pages which are wrapped inside this 'UserLayout' component, like the 'Home' page, etc.
            // The 'children' prop is a special prop that is used to pass the content of the component that is wrapped inside this 'UserLayout' component, like the 'Home' page, etc.
        }
        <NavBarComponent />
      {children}
    </div>
  )
}
