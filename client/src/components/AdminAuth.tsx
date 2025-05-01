import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

/**
 * Simple admin authentication component
 * In a real-world scenario, this would validate against a proper authentication system
 */
export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  // In a real application, this would be a proper secure authentication
  // This is just a placeholder - NEVER use this approach for actual security
  const handleLogin = () => {
    // For demo purposes only, use "admin123" as password
    // In production, this would be replaced with proper authentication
    if (password === 'admin123') {
      toast({
        title: "Authentication successful",
        description: "Welcome to the admin dashboard",
        duration: 3000,
      });
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      onAuthenticated();
    } else {
      setError('Invalid password');
      toast({
        title: "Authentication failed",
        description: "Please check your password and try again",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Authentication</CardTitle>
          <CardDescription>
            Please enter your password to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Button type="submit">Log in</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}