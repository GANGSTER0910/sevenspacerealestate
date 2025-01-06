import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Contact_us from "./pages/Contact_us";
import Header from "./components/Header";
import Service from "./pages/Service";
import Property from "./pages/Property";
const App = () => {
    return (
        <BrowserRouter>
        <Header />
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/sign-in" element={<SignIn />}/>
            <Route path="/sign-up" element={<SignUp />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/contactus" element={<Contact_us />}/>
            <Route path="/service" element={<Service />}/>
            <Route path="/property" element={<Property />}/>
            
            
        </Routes>
        </BrowserRouter>
    );
};

export default App;
