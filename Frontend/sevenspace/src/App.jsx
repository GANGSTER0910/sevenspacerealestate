import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, BrowserRouter } from "react-router-dom";
import Home from "./components/jsx/Home";
import SignIn from "./components/jsx/SignIn";
import SignUp from "./components/jsx/SignUp";
import About from "./components/jsx/About";
import Contact_us from "./components/jsx/Contact_us";
import Header from "./components/jsx/Header";
import Service from "./components/jsx/Service";
import Property from "./components/jsx/Property";
import ForgotPassword from "./components/jsx/ForgotPassword";
import Footer from "./components/jsx/Footer";

const App = () => {
    return (
        <BrowserRouter>
        <Header />
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/SignIn" element={<SignIn />}/>
            <Route path="/SignUp" element={<SignUp />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/contactus" element={<Contact_us />}/>
            <Route path="/service" element={<Service />}/>
            <Route path="/Property" element={<Property />}/>
            <Route path="/ForgotPassword" element={< ForgotPassword/>}/>
            
        </Routes>
        <Footer />
        </BrowserRouter>
    );
};

export default App;
