import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/config/redux/store.js";

export default function App({ Component, pageProps }) {
  return <>
  <Provider store={store}>
    <Component {...pageProps} />; 
    {
      // This 'Component' represents the whole 'application' and 'pageProps' represents the 'props' of the page
  }
  </Provider>
  </>
}
