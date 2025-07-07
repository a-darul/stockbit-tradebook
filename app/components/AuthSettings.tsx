import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AuthSettingsProps {
  authToken: string;
  onAuthTokenChange: (token: string) => void;
}

const AuthSettings: React.FC<AuthSettingsProps> = ({
  authToken,
  onAuthTokenChange,
}) => {
  const [authCollapsed, setAuthCollapsed] = useState(true);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("stockbit_auth_token");
    if (savedToken && !authToken) {
      onAuthTokenChange(savedToken);
    }
  }, []);

  // Save token to localStorage when it changes
  const handleTokenChange = (token: string) => {
    onAuthTokenChange(token);
    if (token) {
      localStorage.setItem("stockbit_auth_token", token);
    } else {
      localStorage.removeItem("stockbit_auth_token");
    }
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => setAuthCollapsed(!authCollapsed)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Authentication Settings</CardTitle>
          {authCollapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </div>
      </CardHeader>
      {!authCollapsed && (
        <CardContent>
          <div className="grid grid-cols-1">
            <Input
              type="password"
              placeholder="Enter your authentication token"
              value={authToken}
              onChange={(e) => handleTokenChange(e.target.value)}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AuthSettings;
