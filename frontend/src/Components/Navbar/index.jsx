import React from 'react';
import styles from "./styles.module.css";
import { useRouter } from 'next/router';

export default function NavBarComponent() {

    const router = useRouter(); // to direct user to the login page if not logged in 'Be a part'

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>

        <h1 onClick={() => {router.push("/")}} style={{cursor: "pointer"}} >Pro Connect</h1>

        <div className={styles.navBarOptionContainer}>
            <div onClick={() => {router.push("/auth")}} className={styles.buttonJoin}><p>Be a part</p></div> 
        </div>

      </nav>
    </div>
  )
}
