import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export default function Dashboard() {

    const router = useRouter();

    const [isTokenThere, setIsTokenThere] = useState(false);

    // If we don't have token then we are pushed to '/login' page,
    // i.e., after 'Sign Up' we are pushed to dashboard, but becoz we don't have 'token' if we are the 'NEW USER', 
    // so we are pushed to login page at first, from where we get the token then enter our 'DASHBOARD'
    useEffect(() => {
        if(localStorage.getItem('token') === null){
            router.push('/auth');
        }

        setIsTokenThere(true);
    });

    useEffect(() => {
        if(isTokenThere){
            router.push('/auth');
        }
    }, [isTokenThere]);
    

    return (
        <div>
        Dashboard
        </div>
    )
}
