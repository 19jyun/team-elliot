'use client'

import React from 'react'
import { ClassCard } from '../ClassCard'
import { TimeSlot } from '../TimeSlot'

export default function TestCardsPage() {
  // Mock data that matches the API response structure
  const mockClassCards = [
    {
      id: 1,
      level: '초급',
      teacher: { name: '김선생님' },
      startTime: '09:00',
      endTime: '10:00',
      dayOfWeek: 'MONDAY',
      backgroundColor: 'blue-100'
    },
    {
      id: 2,
      level: '중급',
      teacher: { name: '이선생님' },
      startTime: '14:00',
      endTime: '15:00',
      dayOfWeek: 'WEDNESDAY',
      backgroundColor: 'green-100'
    },
    {
      id: 3,
      level: '고급',
      teacher: { name: '박선생님' },
      startTime: '16:00',
      endTime: '17:00',
      dayOfWeek: 'FRIDAY',
      backgroundColor: 'yellow-100'
    }
  ]

  const timeSlots = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']

  const handleClassInfoClick = (classId: number) => {
    console.log('Class info clicked:', classId)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="sticky top-0 z-40 flex flex-col bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold text-gray-900">
            Class Cards Test Page
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden mx-auto w-full max-w-[480px]">
        <div className="flex flex-col w-full h-full">
          <div className="flex flex-col mt-0 w-full text-sm font-medium tracking-normal leading-snug text-center whitespace-nowrap text-zinc-600">
            <div className="flex overflow-x-auto scrollbar-hide relative">
              <div className="flex flex-col min-w-[calc(140%+25px)]">
                {/* Header row */}
                <div className="sticky flex relative border-b border-solid border-b-zinc-100 bg-white z-50">
                  <div className="sticky left-0 z-50 bg-white w-[25px] h-[30px]" />
                  <div className="flex flex-1">
                    {['월', '화', '수', '목', '금', '토', '일'].map(
                      (day, index) => (
                        <div key={index} className="flex-1 py-1.5">
                          {day}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Time slots and cards */}
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <div className="flex flex-col w-full relative">
                    {timeSlots.map((hour, index) => (
                      <TimeSlot key={index} hour={hour} />
                    ))}
                    
                    {mockClassCards.map((card) => {
                      console.log('Rendering mock card:', card)
                      
                      // Calculate day index
                      const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(card.dayOfWeek)
                      console.log('Day index for', card.dayOfWeek, ':', dayIndex)
                      
                      // Calculate start hour
                      const timeString = card.startTime || '00:00'
                      const startHour = parseInt(timeString.split(':')[0])
                      console.log('Start hour for', timeString, ':', startHour)
                      
                      // Handle background color
                      const bgColor = card.backgroundColor ? `bg-${card.backgroundColor}` : 'bg-gray-100'
                      console.log('Background color:', bgColor)
                      
                      // Calculate end time (assuming 1 hour duration)
                      const endHour = startHour + 1
                      const endTime = `${endHour.toString().padStart(2, '0')}:00`
                      
                      return (
                        <ClassCard 
                          key={card.id} 
                          level={card.level || '기본'}
                          teacher={card.teacher?.name || '선생님'}
                          startTime={timeString}
                          endTime={card.endTime || endTime}
                          dayIndex={dayIndex}
                          startHour={startHour}
                          bgColor={bgColor}
                          containerWidth="100%"
                          onInfoClick={() => handleClassInfoClick(card.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 