import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const router = useRouter(); // to direct user to the login page if not logged in

  return (
    <UserLayout>
      <div className={styles.container}> 
        {
          // 'styles' is the name of the folder where the Home.module.css file is present, and 'container' is the className present in that file.
          // 'container' is the className; in nextjs we write it as 'styles.container' because we are importing the styles from the Home.module.css file, and we are using the 'container' class from that file.
        }

        <div className={styles.mainContainer}>

          <div className={styles.maincontainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A true social media platform, with stories no blufs !</p>
            <div onClick={() => {router.push("/auth")}} className={styles.buttonJoin}>Join Now</div> 
            {
              // Here we don't need to maintain the router, like we don't need anything to 'import'; THIS IS AN ADVANTAGE OF NEXT.JS, we can directly use the router.push() method to redirect the user to the login page when they click on the button. 
              // Pushing the login page (present in './pages' folder, as here inside './pages/auth' folder has) when the user clicks on the button, if the user is not logged in, they will be redirected to the login page.
            }
          </div>

          <div className={styles.maincontainer_right}>
            <img src="/images/homemain_connection.png" alt=" page" />
          </div>

        </div>

      </div>
    </UserLayout>
  );
}
