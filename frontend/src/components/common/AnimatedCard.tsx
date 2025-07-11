'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnimatedCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onCancel?: () => void;
  buttonText?: string;
  cancelButtonText?: string;
  isButtonDisabled?: boolean;
  children?: React.ReactNode;
}

export function AnimatedCard({
  isExpanded,
  onToggle,
  onCancel,
  buttonText = "확장하기",
  cancelButtonText = "취소",
  isButtonDisabled = false,
  children
}: AnimatedCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-0"></CardHeader>
      <CardContent className="space-y-4">
        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="w-full"
                >
                  {cancelButtonText}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            className="flex-1"
            animate={{
              width: isExpanded ? "50%" : "100%"
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Button 
              onClick={onToggle}
              className="w-full transition-all duration-200 hover:shadow-lg bg-[#AC9592] hover:bg-[#8c7a74]"
              size="lg"
              disabled={isButtonDisabled}
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>

        {/* 확장된 컨텐츠 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 