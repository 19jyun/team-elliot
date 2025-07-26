'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';

interface JoinAcademyCardProps {
  joinCode: string;
  setJoinCode: (code: string) => void;
  isJoining: boolean;
  onJoin: () => void;
}

export function JoinAcademyCard({ joinCode, setJoinCode, isJoining, onJoin }: JoinAcademyCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <LogIn className="h-5 w-5" />
          새 학원 가입
        </CardTitle>
        <CardDescription>
          학원 코드를 입력하여 새로운 학원에 가입하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Input
            placeholder="학원 코드를 입력하세요"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && onJoin()}
          />
          <Button 
            onClick={onJoin} 
            disabled={isJoining || !joinCode.trim()}
            className="min-w-[80px] transition-all duration-300 ease-in-out"
            size="sm"
          >
            {isJoining ? '가입 중...' : '가입'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 