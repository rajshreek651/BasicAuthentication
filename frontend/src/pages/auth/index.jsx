// TYPE 'rfc' TO GET THE BOILERPLATE FOR REACT FUNCTIONAL COMPONENT

import UserLayout from '@/layout/UserLayout';
import React, {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {useRouter} from 'next/router';
import styles from "./style.module.css";
import { loginUser, registerUser } from '@/config/redux/action/authAction';
import { emptyMessage } from "../../config/redux/reducer/authReducer/index.js";

export default function LoginComponent() {

  const authState = useSelector((state) => state.auth);

  const router = useRouter(); // to direct user to the login page if not logged in 'Be a part'

  const dispatch = useDispatch();

  const [isLoginMethod, setIsLoginMethod] = useState(false);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");


  useEffect(() => {
    if (authState.loggedIn){
      router.push("/dashboard");
    }
  }, [authState.loggedIn]); // means whenever 'authState.loggedIn' changed to 'true' then move to dashboard

  useEffect(() => {
    if (localStorage.getItem("token")){
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage()); // whenever we invoke any 'action' then we need to use 'dispatch'
  }, [isLoginMethod]); // means whenever 'isLoginMethod' changed to 'true' then move to dashboard

  const handleRegister = () => {
    console.log("registering...");
    dispatch(registerUser({username, name, email, password}))
  };

  const handleLogin = () => {
    console.log("logging in...");
    dispatch(loginUser({email, password}))
  };

  return (
    <UserLayout>

      <div className={styles.container}>

        <div className={styles.cardContainer}>

          <div className={styles.cardContainer_left}>

            {
              // If the person is signing in (logging in) then show the sign in form else show the sign up (register) form
            }
            <p className={styles.cardleft_heading}> {isLoginMethod ? "Sign In" : "Sign Up"} </p>
            <p style={{color: authState.isError ? "red" : "green"}}> {authState.message} </p>

            <div className={styles.inputContainers}>
              {!isLoginMethod && // If user is logging in , then we won't ask for username and name, as we only need email and password to login, as in backend requirement
                <div className={styles.inputRow}>
                  {
                    // use 'onChange={(e) => setUsername(e.target.value)}' to track changes in I/P box
                  }
                  <input onChange={(e) => setUsername(e.target.value)} className={styles.inputField} placeholder="Username" />
                  <input onChange={(e) => setName(e.target.value)} className={styles.inputField} placeholder="Name" />
                </div>
              }

              {
                // As in backend, we need just 'email' and 'password' to login, so we will not show username and name fields when the user is logging in
              }
              <input onChange={(e) => setEmailAddress(e.target.value)} className={styles.inputField} placeholder="Email" />
              <input onChange={(e) => setPassword(e.target.value)} className={styles.inputField} placeholder="Password" />

              <div onClick={() => {
                if(isLoginMethod){
                  // Login
                  handleLogin();
                }else{
                  // Register
                  handleRegister();
                }
              }} className={styles.buttonWithOutline}>
                <p>{isLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>

          </div>

          <div className={styles.cardContainer_right}>

            {isLoginMethod ? <p>Don't have an account ?</p> : <p>Already have an account ?</p>
              // If 'DON'T HAVE AN ACCOUNT', THEN 'SIGN UP' OR 'REGISTER'
              // If 'ALREADY HAVE AN ACCOUNT', THEN 'SIGN IN' OR 'LOGIN'
            }
            <div onClick={() => {
              {
                // If the user is logging in, then show 'Sign Up' as user may not have an account, else show 'Sign In' as user may already have an account
              }
              setIsLoginMethod(!isLoginMethod);

              }} style={{color: "black", textAlign: "center"}} className={styles.buttonWithOutline}>
                <p>{isLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>

          </div>

        </div>

      </div>
    </UserLayout>
  )
}
