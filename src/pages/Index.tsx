import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for OAuth callback code and redirect to settings to handle it
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      navigate('/settings' + window.location.search);
    }
  }, [navigate]);

  return <Dashboard />;
};

export default Index;
