import React from "react";
import { IconCalendarPlus, IconShare, IconSettings } from "@tabler/icons-react";

const steps = [
  {
    icon: <IconCalendarPlus size={48} color="#bfc3f7" />,
    title: "Create your event",
    desc: "Set up your event in under 3 minutes. Add details, upload images, set pricing, and customize your event page to match your brand",
  },
  {
    icon: <IconShare size={48} color="#bfc3f7" />,
    title: "Reach your audience",
    desc: "Share with built in promotional tools. Send to your network, post on social media, or let our discovery features help people find your event",
  },
  {
    icon: <IconSettings size={48} color="#bfc3f7" />,
    title: "Manage everything",
    desc: "Track sales in real time, communicate with attendees, handle check-ins, and access detailed analytics—all from your dashboard",
  },
];

const HowToSection = () => {
  return (
    <section className="w-full bg-[#f2fae6] py-20 px-4 flex flex-col items-center  min-h-[70vh]">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-[#201e36] mb-6">
        Create Buzz, Fill Seats, Make It Happen
      </h2>
      <p className="text-lg md:text-xl text-center text-[#201e36] font-medium mb-10 max-w-2xl">
        Effortlessly organize your next event with just a few clicks—our
        platform makes it simple from start to finish.
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-12 w-full max-w-5xl">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center max-w-xs text-center"
          >
            {/* Icon in circle */}
            <div className="w-24 h-24 rounded-full bg-[#201e36] mb-6 flex items-center justify-center">
              {step.icon}
            </div>
            <div className="text-xl font-bold mb-2 text-[#232323]">
              {step.title}
            </div>
            <div className="text-base text-[#232323] font-medium">
              {step.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowToSection;
