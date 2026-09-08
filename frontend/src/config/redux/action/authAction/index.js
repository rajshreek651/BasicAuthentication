import {createAsyncThunk} from '@reduxjs/toolkit';
import clientServer from '../../../index.jsx'; // Importing the 'clientServer' instance from the 'clientServer.js' file in the 'axios' folder. This instance is used to make API calls to the backend server. The 'clientServer' instance is created using the 'axios.create()' method, which allows us to create a new instance of axios with a custom configuration. The custom configuration includes the base URL of the backend server, which is defined in the 'clientServer.js' file. By using this instance, we can make API calls to the backend server without having to specify the base URL every time we make a request.

export const loginUser = createAsyncThunk(
  'user/login',
  async (user, thunkAPI) => { 
    try{

        const response = await clientServer.post(`/login`, { // name should be same as given in 'routes.js' in 'backend' folder
            email: user.email,
            password: user.password
            // If any error comes like 'email not found' or 'password is incorrect', it will be handled in the 'backend' folder in 'routes.js' file and will be sent to the frontend as a response. So, we can handle it here in the frontend.
        });

        // If the response is successful, we can return the response data to the 'fulfilled' state of the 'loginUser' action.
        if(response.data.token){
            localStorage.setItem('token', response.data.token); // Store the user data in localStorage
        }else{
            return thunkAPI.rejectWithValue({message: "token not provided"}); // If the response is not successful, we can return the response data to the 'rejected' state of the 'loginUser' action.
        }

        return thunkAPI.fulfillWithValue(response.data.token); // Return the response data to the 'fulfilled' state of the 'loginUser' action.

    }catch(err) {
        return thunkAPI.rejectWithValue(
            err.response?.data || { message: err.message }
        );
    }
   }
);

export const registerUser = createAsyncThunk(
    'user/register',
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post('/register', {
                username: user.username,
                name: user.name,
                email: user.email,
                password: user.password
            });

            return response.data;

        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || {
                    message: err.message
                }
            );
        }
    }
);