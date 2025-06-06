import React from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { useLoadUserQuery } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BuyCourseButton = ({ courseId }) => {
  const navigate = useNavigate();
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const { refetch: refetchUser } = useLoadUserQuery();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/purchase/verify-payment",
        paymentData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (err) {
      console.error("Payment verification failed:", err);
      throw err;
    }
  };

  const openRazorpayCheckout = async (orderData) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Razorpay SDK failed to load. Please check your internet.");
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Course Purchase",
      description: orderData.courseTitle || "Course Purchase",
      order_id: orderData.orderId,
      handler: async function (response) {
        try {
          const result = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (result.success) {
            toast.success("Payment successful!");
            await refetchUser(); // Refresh user data to get updated enrolled courses
            navigate("/my-learning");
          } else {
            toast.error(result.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        name: "User",
        email: "user@example.com",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function() {
          toast.error("Payment cancelled");
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Failed to initialize Razorpay:", error);
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const handleBuyCourse = async () => {
    try {
      const result = await createCheckoutSession(courseId);
      if (result.data?.success) {
        await openRazorpayCheckout(result.data);
      } else {
        toast.error(result.data?.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error(error.data?.message || "Failed to create checkout session");
    }
  };

  return (
    <Button 
      onClick={handleBuyCourse} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      ) : (
        "Buy Now"
      )}
    </Button>
  );
};

export default BuyCourseButton;
