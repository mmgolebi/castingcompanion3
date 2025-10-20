'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

export function ManageMembershipButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open billing portal');
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      variant="outline" 
      className="w-full sm:w-auto"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Membership
        </>
      )}
    </Button>
  );
}
