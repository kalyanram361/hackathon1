import {useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../api/axios";

function Login(){
    const [form,setForm]= useState({ email :"", password: ""});
    const [message,setMessage]= useState("");
    const navigate = useNavigate();

    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    };

    const handleSubmit= async (e)=>{
          e.preventDefault();
          try{
            const res = await api.post("/login",form);
            setMessage(res.data.message || "Login successful");
            console.error("Login successful:", res.data);
            // Save the token for future use
            localStorage.setItem("token", res.data.token);
            // Redirect immediately
            navigate("/dashboard", { replace: true });
          }catch(err){
             console.error("Login error:", err.response);
             setMessage(err.response.data.message || "Login failed");
          }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login Page</h2>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
                />
                <button 
                    type="submit"
                    className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                    Login
                </button>
            </form>
            {message && <p className="mt-4 text-center text-gray-700 bg-white p-3 rounded-lg shadow-md">{message}</p>}
        </div>
    );
}
export default Login;