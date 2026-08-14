'use client';

import { motion } from 'framer-motion';
import CourseCard from './CourseCard';
import { Course } from '@/lib/types';

interface CourseGridProps {
  courses: Course[];
  isLoggedIn: boolean;
  subscribedCourseIds: string[];
  onCourseClick: (courseId: string) => void;
  onLockedClick: (courseId?: string) => void;
}

export default function CourseGrid({
  courses,
  isLoggedIn,
  subscribedCourseIds,
  onCourseClick,
  onLockedClick,
}: CourseGridProps) {
  const comprehensiveCourse = courses.find(c => c.level === 'شامل');
  const otherCourses = courses.filter(c => c.level !== 'شامل');

  // Removed container and item variants to use individual whileInView for reliable bi-directional scroll animation

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 dir-rtl">
      {/* Comprehensive Course */}
      {comprehensiveCourse && (
        <section>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-center gap-4"
          >
            <h2 className="text-3xl font-aref font-bold text-gray-900">الكورس الشامل</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </motion.div>
          <motion.div
            id="tour-comprehensive"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-2/3 mx-auto"
          >
            <CourseCard 
              course={comprehensiveCourse} 
              isLocked={!isLoggedIn || (!subscribedCourseIds.includes(comprehensiveCourse.id))} 
              onClick={() => (!isLoggedIn || !subscribedCourseIds.includes(comprehensiveCourse.id)) ? onLockedClick(comprehensiveCourse.id) : onCourseClick(comprehensiveCourse.id)}
            />
          </motion.div>
        </section>
      )}

      {/* Other Levels */}
      {otherCourses.length > 0 && (
        <section>
          {/* Top Separator Images */}
          {comprehensiveCourse && (
            <div className="flex justify-center items-center gap-2 md:gap-8 my-10 px-2">
              <img
                src="https://i.postimg.cc/T2FXDXf0/image.webp"
                alt=""
                className="w-24 md:w-56 object-contain select-none"
                draggable={false}
              />
              <img
                src="https://i.postimg.cc/T2FXDXf0/image.webp"
                alt=""
                className="w-24 md:w-56 object-contain select-none"
                draggable={false}
              />
              <img
                src="https://i.postimg.cc/T2FXDXf0/image.webp"
                alt=""
                className="w-24 md:w-56 object-contain select-none"
                draggable={false}
              />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-center gap-4"
          >
            <h2 className="text-3xl font-aref font-bold text-gray-900">باقي المستويات</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </motion.div>

          {/* Bottom Separator Images */}
          <div className="flex justify-center items-center gap-2 md:gap-8 mb-10 px-2">
            <img
              src="https://i.postimg.cc/T2FXDXf0/image.webp"
              alt=""
              className="w-24 md:w-56 object-contain select-none"
              draggable={false}
            />
            <img
              src="https://i.postimg.cc/T2FXDXf0/image.webp"
              alt=""
              className="w-24 md:w-56 object-contain select-none"
              draggable={false}
            />
            <img
              src="https://i.postimg.cc/T2FXDXf0/image.webp"
              alt=""
              className="w-24 md:w-56 object-contain select-none"
              draggable={false}
            />
          </div>

          <div
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
          >
            {otherCourses.map((course) => (
              <motion.div 
                key={course.id} 
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.1, margin: "50px" }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col h-full"
              >
                <CourseCard 
                  course={course} 
                  isLocked={!isLoggedIn || (!subscribedCourseIds.includes(course.id))} 
                  onClick={() => (!isLoggedIn || !subscribedCourseIds.includes(course.id)) ? onLockedClick(course.id) : onCourseClick(course.id)}
                />
                <div className="flex justify-center mt-6 mb-2">
                  <img
                    src="https://i.postimg.cc/KcwyMyx5/image-(1).webp"
                    alt=""
                    className="w-24 md:w-32 object-contain select-none opacity-80 mix-blend-multiply"
                    draggable={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
