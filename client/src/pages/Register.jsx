import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Citizen",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!form.agree) {
      setMessage("You must agree to the terms");
      return;
    }
    try {
      const res = await api.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setMessage(res.data.message || "Registration successful");
       // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-2">
          <span className="mr-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#2ecc40" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C10 10 2 12 2 12s2 8 10 10c8-2 10-10 10-10s-8-2-10-10z"/>
            </svg>
          </span>
          <span className="text-2xl font-bold text-gray-800">EcoMap</span>
        </div>
        <div className="text-lg text-center text-gray-600 mb-6">Create your account</div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Full Name</span>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your full name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Email Address</span>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email address" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">User Role</span>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent bg-white"
            >
              <option value="Citizen">Citizen</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Official">Official</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Password</span>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</span>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm your password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green focus:border-transparent"
            />
          </label>
          <label className="flex items-start space-x-2">
            <input 
              type="checkbox" 
              name="agree" 
              checked={form.agree} 
              onChange={handleChange} 
              className="w-4 h-4 text-eco-green border-gray-300 rounded focus:ring-eco-green mt-1"
            />
            <span className="text-sm text-gray-600">
              I have read and agree to the <a href="#" className="text-eco-green hover:underline">Terms of Service</a> and <a href="#" className="text-eco-green hover:underline">Privacy Policy</a>
            </span>
          </label>
          <button 
            type="submit" 
            className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Create Account
          </button>
          {message && <div className="mt-4 p-3 text-center text-gray-700 bg-gray-100 rounded-lg">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default Register;