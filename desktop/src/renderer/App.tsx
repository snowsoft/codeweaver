import React from 'react';
import { Code2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

export default function App() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <header className='flex items-center justify-between p-4 border-b border-gray-700'>
        <div className='flex items-center space-x-3'>
          <Code2 className='h-8 w-8 text-blue-500' />
          <h1 className='text-xl font-bold'>CodeWeaver Desktop</h1>
        </div>
        <div className='text-sm text-gray-400'>v1.0.0</div>
      </header>
      
      <main className='container mx-auto p-6'>
        <Card className='max-w-2xl mx-auto mt-20'>
          <CardHeader>
            <CardTitle className='text-3xl text-center'>
              Welcome to CodeWeaver
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-gray-400 mb-6'>
              AI-Powered Development Assistant
            </p>
            <Button size='lg'>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}