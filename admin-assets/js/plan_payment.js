var api_key = "";
var payment_type = "";
var currency = "";
var price = $("#price").val();
var plan_id = $("#plan_id").val();
var user_name = $("#user_name").val();
var user_email = $("#user_email").val();
var user_mobile = $("#user_mobile").val();
var grand_total = $("#grand_total").val();
if ($("#stripe_public_key").val() != null) {
  var stripe_public_key = $("#stripe_public_key").val();
  var stripe = Stripe(stripe_public_key);
  var card = stripe.elements().create("card", {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d"
      }
    }
  });
  card.mount("#card-element");
  $(".__PrivateStripeElement iframe").removeAttr("style");
}
$("input[name=paymentmode]").on("click", function(e) {
  "use strict";
  $(".payment_error").addClass("d-none");
  api_key = $("input[name=paymentmode]:checked").val();
  currency = $("input[name=paymentmode]:checked").attr("data-currency");
  payment_type = $("input[name=paymentmode]:checked").attr(
    "data-transaction-type"
  );
  if (payment_type == "3") {
    $(".stripe-form").removeClass("d-none");
  } else {
    $(".stripe-form").addClass("d-none");
  }
});
$(".buy_now").on("click", function(e) {
  "use strict";
  $(".buy_now").prop("disabled", true);
  $(".buy_now").html('<span class="loader"></span>');
  setTimeout(function() {
    if ($("input[name=paymentmode]:checked").length == 0) {
      $(".payment_error").removeClass("d-none");
      $(".buy_now").prop("disabled", false);
      $(".buy_now").html("Buy Now");
      return false;
    } else {
      $(".payment_error").addClass("d-none");
      $(".buy_now").prop("disabled", false);
      $(".buy_now").html("Buy Now");
    }
  }, 10000);

  // cod
  $("#preloader").show();
  if (payment_type == "1") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl,
      type: "post",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        payment_type: payment_type,
        payment_id: "",
        discount: discount,
        offer_code: offer_code
      },
      success: function(response) {
        $("#preloader").show();
        // $('#preloader').hide();
        if (response.status == 0) {
          toastr.error(response.message);
          return false;
        } else {
          window.location.href = planlisturl;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }
  // RazorPay
  if (payment_type == "2") {
    var options = {
      key: api_key,
      amount: parseFloat(grand_total * 100),
      name: title,
      description: description,
      image: "https://badges.razorpay.com/badge-light.png",
      handler: function(response) {
        $("#preloader").show();
        $.ajax({
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
          },
          url: buyurl,
          type: "post",
          data: {
            amount: grand_total,
            plan_id: plan_id,
            payment_type: payment_type,
            payment_id: response.razorpay_payment_id,
            discount: discount,
            offer_code: offer_code
          },
          success: function(response) {
            $("#preloader").hide();
            if (response.status == 0) {
              toastr.error(response.message);
              return false;
            } else {
              window.location.href = planlisturl;
            }
          },
          error: function(error) {
            $("#preloader").hide();
            toastr.error(wrong);
            return false;
          }
        });
      },
      modal: {
        ondismiss: function() {
          location.reload();
        }
      },
      prefill: {
        name: user_name,
        email: user_email,
        contact: user_mobile
      },
      theme: {
        color: "#528FF0"
      }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
  }
  // Stripe
  if (payment_type == "3") {
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        $(".stripe_error").html(result.error.message);
        return false;
      } else {
        $("#preloader").show();
        $.ajax({
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
          },
          url: buyurl,
          type: "post",
          data: {
            amount: parseInt(grand_total),
            plan_id: plan_id,
            currency: currency,
            payment_type: payment_type,
            payment_id: result.token.id,
            discount: discount,
            offer_code: offer_code
          },
          success: function(response) {
            $("#preloader").hide();
            if (response.status == 0) {
              toastr.error(response.message);
              return false;
            } else {
              window.location.href = planlisturl;
            }
          },
          error: function(error) {
            $("#preloader").hide();
            toastr.error(wrong);
            return false;
          }
        });
      }
    });
  }
  // Flutterwave
  if (payment_type == "4") {
    FlutterwaveCheckout({
      public_key: api_key,
      tx_ref: user_name,
      amount: parseInt(grand_total),
      currency: currency,
      discount: discount,
      offer_code: offer_code,
      payment_options: "",
      customer: {
        email: user_email,
        phone_number: user_mobile,
        name: user_name
      },
      callback: function(response) {
        $("#preloader").show();
        $.ajax({
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
          },
          url: buyurl,
          type: "post",
          data: {
            amount: parseInt(grand_total),
            plan_id: plan_id,
            payment_type: payment_type,
            payment_id: response.flw_ref,
            tax: tax
          },
          success: function(response) {
            $("#preloader").hide();
            if (response.status == 0) {
              toastr.error(response.message);
              return false;
            } else {
              window.location.href = planlisturl;
            }
          },
          error: function(error) {
            $("#preloader").hide();
            toastr.error(wrong);
            return false;
          }
        });
      },
      onclose: function() {
        location.reload();
      },
      customizations: {
        title: title,
        description: description,
        logo: "https://flutterwave.com/images/logo/logo-mark/full.svg"
      }
    });
  }
  // Paystack
  if (payment_type == "5") {
    var handler = PaystackPop.setup({
      key: api_key,
      email: user_email,
      amount: parseInt(grand_total) * 100,
      currency: currency, // Use GHS for Ghana Cedis or USD for US Dollars
      callback: function(response) {
        $("#preloader").show();
        $.ajax({
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
          },
          url: buyurl,
          type: "post",
          data: {
            amount: parseInt(grand_total),
            plan_id: plan_id,
            payment_type: payment_type,
            payment_id: response.reference,
            discount: discount,
            offer_code: offer_code
          },
          success: function(response) {
            $("#preloader").hide();
            if (response.status == 0) {
              toastr.error(response.message);
              return false;
            } else {
              window.location.href = planlisturl;
            }
          },
          error: function(error) {
            $("#preloader").hide();
            toastr.error(wrong);
            return false;
          }
        });
      },
      onClose: function() {
        window.location.reload();
      }
    });
    handler.openIframe();
  }
  // Banktransfer
  if (payment_type == "6") {
    $("#modalbankdetails").modal("show");
    $("#payment_description").html($("#bank_payment").val());
    $("#modal_plan_id").val(plan_id);
    $("#modal_payment_type").val(payment_type);
    $("#modal_amount").val(grand_total);
  }
  // Mercado pago
  if (payment_type == "7") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/mercadorequest",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }
  // PayPal
  if (payment_type == "8") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/paypalrequest",
      data: {
        amount: parseInt(grand_total),
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        return: "1",
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          $(".callpaypal").trigger("click");
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  // myfatoorah
  if (payment_type == "9") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/myfatoorahrequest",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        return: "1",
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //toyyibpay
  if (payment_type == "10") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/toyyibpay",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //phonepe
  if (payment_type == "11") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/phonepe",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //paytab
  if (payment_type == "12") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/paytab",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //mollie
  if (payment_type == "13") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/mollie",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //khalti
  if (payment_type == "14") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/khalti",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }

  //xendit
  if (payment_type == "15") {
    $("#preloader").show();
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: buyurl + "/xendit",
      data: {
        amount: grand_total,
        plan_id: plan_id,
        plan_name: plan_name,
        plan_description: plan_description,
        payment_type: payment_type,
        payment_id: "",
        successurl: buyurl + "/paymentsuccess/success",
        failureurl: location.href,
        discount: discount,
        offer_code: offer_code
      },
      method: "POST",
      success: function(response) {
        $("#preloader").hide();
        if (response.status == 1) {
          window.location.href = response.redirecturl;
        } else {
          toastr.error(response.message);
          return false;
        }
      },
      error: function(error) {
        $("#preloader").hide();
        toastr.error(wrong);
        return false;
      }
    });
  }
});

function applyCopon() {
  $("#couponmodal").modal("hide");
  $.ajax({
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    },
    url: applycouponurl,
    method: "post",
    data: {
      promocode: $("#promocode").val(),
      sub_total: sub_total
    },
    success: function(response) {
      $("#preloader").hide();
      if (response.status == 1) {
        location.reload();
      } else {
        toastr.error(response.message);
        $("#couponmodal").modal("hide");
      }
    }
  });
}
function removecoupon() {
  $.ajax({
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    },
    url: removecouponurl,
    method: "post",
    data: {
      promocode: $("#promocode").val()
    },
    success: function(response) {
      $("#preloader").hide();
      if (response.status == 1) {
        location.reload();
      } else {
        toastr.error(response.message);
      }
    }
  });
}
function copy(offer_code) {
  $("#couponmodal").modal("hide");
  $("#promocode").val(offer_code);
}
