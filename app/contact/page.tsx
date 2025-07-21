import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

export default function ContactPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] py-16 bg-[#f2fae6]">
      <Card className="w-full max-w-md mx-auto shadow-lg border-[#bfc3f7]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#201e36] text-center">
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Contact Info */}
          <div className="mb-8 flex flex-col gap-2 text-[#201e36] text-base">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="email">
                📧
              </span>
              <span>hello@surlamap.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="phone">
                📞
              </span>
              <span>+1 234 567 890</span>
            </div>
            <div className="flex items-center gap-2">
              <span role="img" aria-label="address">
                📍
              </span>
              <span>123 Main St, Your City</span>
            </div>
          </div>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your Name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Type your message..."
              />
            </div>
            <Button
              type="submit"
              className="bg-[#bfc3f7] text-[#201e36] font-semibold hover:bg-[#aab3e6] w-full"
            >
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
