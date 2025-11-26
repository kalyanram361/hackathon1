import { Link } from "react-router-dom";
import {useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';

function Home() {
  const [isLoggedIn, setIsLoggedIn] =useState(false);
  //check if user is Logged in
  useEffect(() =>{
    const token = localStorage.getItem("token") || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleRestrictedClick =(e)=>{
    if(!isLoggedIn){
      e.preventDefault();
      alert('Please login or Register first');
    }
  }
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="flex justify-between items-center px-8 py-6">
          <div className="flex items-center text-2xl font-bold text-gray-800">
            EcoMap
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#2ecc40" xmlns="http://www.w3.org/2000/svg" style={{marginLeft: "0.3rem"}}>
              <path d="M12 2C10 10 2 12 2 12s2 8 10 10c8-2 10-10 10-10s-8-2-10-10z"/>
            </svg>
          </div>
          <nav className="flex items-center space-x-8">
            <Link
             to={isLoggedIn ? "/map" : "#"} 
            className={`${isLoggedIn ? 'text-gray-700 hover:text-eco-green' : 'text-gray-400 cursor-not-allowed'} transition-colors`}
            onClick={handleRestrictedClick}
             >Environment Map</Link>
           <Link 
              to={isLoggedIn ? "/report" : "#"} 
              className={`${isLoggedIn ? 'text-gray-700 hover:text-eco-green' : 'text-gray-400 cursor-not-allowed'} transition-colors`}
              onClick={handleRestrictedClick}
            >
              Issue Reports
            </Link>
             {isLoggedIn && (
              <Link 
                to="/dashboard"
                className="text-gray-700 hover:text-eco-green transition-colors"
              >
                Dashboard
              </Link>
            )}
           {!isLoggedIn ? (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-eco-green transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2 bg-eco-green text-white rounded-lg hover:bg-green-600 transition-colors">Register</Link>
              </>
            ) : (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  sessionStorage.removeItem('token');
                  setIsLoggedIn(false);
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </header>
        <div className="flex flex-col items-center justify-center text-center px-8 py-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Together We Protect <br />
            Our <span className="text-eco-green">Green Home</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
            Discover environmental issues and report them instantly. Government responds quickly, volunteers participate actively. Let's create a better living environment together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/register" className="px-8 py-3 bg-eco-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Register to Report Issues
                </Link>
                <Link to="/login" className="px-8 py-3 border-2 border-eco-green text-eco-green rounded-lg font-semibold hover:bg-eco-green hover:text-white transition-colors">
                  Login to View Map
                </Link>
              </>
            ) : (
              <>
                <Link to="/report" className="px-8 py-3 bg-eco-green text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Report Issue Now
                </Link>
                <Link to="/map" className="px-8 py-3 border-2 border-eco-green text-eco-green rounded-lg font-semibold hover:bg-eco-green hover:text-white transition-colors">
                  View Environment Map
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="py-16 px-8 bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Platform Features</h2>
        <p className="text-xl text-center text-gray-600 mb-12">Easy-to-use environmental monitoring platform</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-green-50 border-l-4 border-green-500 p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <svg width="32" height="32" fill="#21b573" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Quick Location Reporting</h3>
            <p className="text-gray-600">Precisely mark problem locations on the map, upload photos and detailed descriptions for quick understanding by relevant departments</p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <svg width="32" height="32" fill="#2979ff" viewBox="0 0 24 24"><path d="M12 2L2 7v2h20V7L12 2zm0 2.18L18.09 7H5.91L12 4.18zM4 10v10h16V10H4zm2 2h2v6H6v-6zm4 0h2v6h-2v-6zm4 0h2v6h-2v-6z"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Government Quick Response</h3>
            <p className="text-gray-600">Relevant departments handle issues promptly, update resolution progress, ensuring every environmental problem gets proper attention</p>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-8 rounded-lg shadow-md">
            <div className="mb-4">
              <svg width="32" height="32" fill="#ff7043" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Volunteer Participation</h3>
            <p className="text-gray-600">Volunteers can participate in problem resolution, upload progress photos, and work together to maintain a beautiful environment</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-8 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">How to Participate</h2>
        <p className="text-xl text-center text-gray-600 mb-12">Three simple steps to contribute to environmental protection</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-eco-green text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">1</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Create Account</h3>
            <p className="text-gray-600">Choose your role: Citizen, Government Authority, Volunteer, or Administrator</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-eco-green text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">2</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Discover Issues</h3>
            <p className="text-gray-600">Mark environmental problems on the map, upload photos, and provide detailed descriptions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-eco-green text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">3</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Participate in Solutions</h3>
            <p className="text-gray-600">Vote for important issues, join discussions, and help resolve environmental problems</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center text-2xl font-bold mb-4">
                EcoMap
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#2ecc40" style={{marginLeft: "0.3rem"}}>
                  <path d="M12 2C10 10 2 12 2 12s2 8 10 10c8-2 10-10 10-10s-8-2-10-10z"/>
                </svg>
              </div>
              <p className="text-gray-400">Protecting the environment starts with me</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Environmental Issue Reporting</li>
                <li>Real-time Map View</li>
                <li>Progress Tracking</li>
                <li>Volunteer Participation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">User Roles</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Citizens</li>
                <li>Government Authorities</li>
                <li>Environmental Volunteers</li>
                <li>Platform Administrators</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Hotline: 400-123-4567</li>
                <li>Email: support@ecomap.com</li>
                <li>Hours: 9:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          © 2024 EcoMap. Protecting the environment is everyone's responsibility.
        </div>
      </footer>
    </div>
  );
}

export default Home;