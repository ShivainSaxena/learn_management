// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
// import CourseContent from "./components/CourseContent";
// import { CoursesProvider } from "./context/CoursesContext";

// function App() {
//   return (
//     <CoursesProvider>
//       <Router>
//         <div className="min-h-screen bg-gray-50 flex flex-col">
//           <header className="bg-white shadow-sm">
//             <div className="container mx-auto px-4 py-4">
//               <Link
//                 to="/"
//                 className="text-2xl font-bold text-blue-600 hover:text-blue-800"
//               >
//                 LaunchSTEM Learn Management
//               </Link>
//             </div>
//           </header>

//           <main className="container mx-auto px-4 py-8 flex-grow">
//             <Routes>
//               <Route path="/" element={<Dashboard />} />
//               <Route path="/course/:courseId/*" element={<CourseContent />} />
//             </Routes>
//           </main>

//           <footer className="bg-white shadow-sm">
//             <div className="container mx-auto px-4 py-4 text-center text-gray-600">
//               © 2025 LaunchSTEM Course Management System. All rights reserved.
//             </div>
//           </footer>
//         </div>
//       </Router>
//     </CoursesProvider>
//   );
// }

// export default App;

// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import CourseContent from "./components/CourseContent";
import { CoursesProvider } from "./context/CoursesContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-800"
          >
            LaunchSTEM Learn Management
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/course/:courseId/*" element={<CourseContent />} />
        </Routes>
      </main>

      <footer className="bg-white shadow-sm mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          © 2025 LaunchSTEM Course Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CoursesProvider>
        <Router>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </Router>
      </CoursesProvider>
    </AuthProvider>
  );
}

export default App;
