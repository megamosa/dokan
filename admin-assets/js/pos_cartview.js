$("#customer1").on("change", function() {
  $("#customer_info").val($("#customer1").val());
});
$("#customer").on("change", function() {
  "use strict";
  $("#customer_info").val($("#customer").val());
});
$(".give_discount").on("keyup", function() {
  "use strict";
  var discount = $(this).val();
  $("#discount").val($(this).val());
  $("#discount1").val($(this).val());
  var grand_total = $("#grand_total1").val();
  var sub_total = $("#sub_total").val();
  if (discount == "") {
    discount = 0;
  }
  if (parseFloat(sub_total - discount) >= 0) {
    $("#discount_amount1").html(currency_formate(discount));
    $("#discount_amount11").html(currency_formate(discount));
    $("#discount_amount").val(discount);
    $("#total_amount1").html(
      currency_formate(parseFloat(grand_total - discount))
    );
    $("#total_amount").html(
      currency_formate(parseFloat(grand_total - discount))
    );
    $("#grand_total").val(parseFloat(grand_total - discount));
    $("#discounttotal").val(parseFloat(parseFloat(grand_total - discount)));
    $("#modal_total_amount").val(parseFloat(grand_total - discount));
  } else {
    $("#discount_amount1").html(currency_formate(0));
    $("#discount_amount11").html(currency_formate(0));
    $("#discount_amount").val(0);
    $("#total_amount1").html(currency_formate(parseFloat(grand_total)));
    $("#total_amount").html(currency_formate(parseFloat(grand_total)));
    $("#grand_total").val(parseFloat(grand_total));
    $("#discounttotal").val(parseFloat(parseFloat(grand_total)));
    $("#modal_total_amount").val(parseFloat(grand_total));
    toastr.error(discount_message);
  }
});
function showaddons(name, price) {
  "use strict";
  $("#modal_selected_addons")
    .find(".list-group-flush")
    .html(
      '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>'
    );
  var response = "";
  $.each(name.split("|"), function(key, value) {
    response +=
      '<li class="list-group-item"> <b> ' +
      value +
      ' </b> <p class="mb-0">' +
      currency_formate(price.split("|")[key]) +
      "</p> </li>";
  });
  $("#modal_selected_addons").find(".list-group-flush").html(response);
  $("#modal_selected_addons").modal("show");
}
function qtyupdate(id, type, qtyurl, item_id, variant_id, cart_qty) {
  "use strict";
  $.ajax({
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    },
    url: qtyurl,
    data: {
      id: id,
      type: type,
      item_id: item_id,
      variant_id: variant_id,
      qty: cart_qty
    },
    method: "POST",
    success: function(response) {
      // console.log(response);

      if (response.status === 1) {
        $("#cartItemsContainer").html(response.output);
        var cartOffCanvas = new bootstrap.Offcanvas(
          document.getElementById("cart-offCanvas")
        );
        cartOffCanvas.show();
      } else {
        console.error("Unexpected response status: " + response.status);
        toastr.error(response.message);
      }
    },
    error: function(e) {
      $("#preload").hide();
      $(".err" + id).html(e.message);
      return false;
    }
  });
}

function OrderNow(ordernowurl) {
  "use strict";
  var customerid = $('#customer').val();
  var sub_total = $('.sub_total').text();
  // Retrieve and concatenate tax names and rates
  var tax_names = [];
  var tax_rates = [];
  
  $('.tax_name').each(function() {
    tax_names.push($(this).text().trim());
  });
  
  $('.tax-rate').each(function() {
    tax_rates.push($(this).text().trim());
  });
  
  var tax_names_str = tax_names.join('| ');
  var tax_rates_str = tax_rates.join('| '); 

  var discount_amount = $('#discount_amount').text(); 
  var grand_total = $('.grand_total').text();

    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      data:{
        customerid : customerid,
      },
      url: ordernowurl,
      method: "POST",
      success: function(response) {
        if (response.status === 1) {
          $('#OrderNowContainer').html(response.output);
          $('#orderButton').modal('show');
          $('#orderdiscount_amount').text(discount_amount);  
          $('#hiddendiscount_amount').val(discount_amount);  
         // Split tax names and rates
         var tax_names_list = tax_names_str.split('| ');
         var tax_rates_list = tax_rates_str.split('| ');
 
         // Clear previous content
         $('#ordertax_name').empty();
         $('#ordertax_rate').empty();
 
         // Display each tax name and rate
         tax_names_list.forEach(function(name, index) {
           var rate = tax_rates_list[index] || ''; // Handle case where tax_rates_list is shorter
           $('#ordertax_name').append(`<div>${name}</div>`);
           $('#ordertax_rate').append(`<div>${rate}</div>`);
         });

          $('#hiddentax_name').text(tax_names_str);
          $('#hiddentax_rate').text(tax_rates_str);
          $('#ordersub_total').text(sub_total);
          $('#ordergrand_total').text(grand_total);

        
      } else {
          console.erro
      }
    }
    });
}
// document.getElementById('apply-discount').addEventListener('click', function() {

//     var discountValue = document.getElementById('discount-input').value;

//     $.ajax({
//         headers: {
//             'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
//         },
//         url: discounturl,
//         data: {
//             discount: discountValue
//         },
//         method: 'POST',
//         success: function(response) {
//             $('#discount_amount').text(response.discount);
//             $('#discount-input').text(response.discount);
//             console.log(response);
//         },
//         error: function(xhr) {
//             // Handle error
//             console.error('An error occurred:', xhr.responseText);
//         }

//     });
// });

$("#apply-discount").on("click", function() {
  var discountValue =
    parseFloat(document.getElementById("discount-input").value) || 0;
  var subtotal1 =
    parseFloat($(".sub_total1").text().replace(/[^0-9.-]+/g, "")) || 0;

  if (discountValue <= subtotal1) {
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: discounturl, // Ensure this is the correct URL for your endpoint
      data: {
        discount: discountValue
      },
      method: "POST",
      success: function(response) {
        var discount = parseFloat(response.discount) || 0;
        $("#discount_amount").text(`-${currency_formate(discount)}`);
        var subtotal1 =
          parseFloat($(".sub_total1").text().replace(/[^0-9.-]+/g, "")) || 0;
        var taxTotal =
          parseFloat(
            $(".tax-rate").toArray().reduce(function(total, element) {
              return (
                total + parseFloat($(element).text().replace(/[^0-9.-]+/g, ""))
              );
            }, 0)
          ) || 0;

        var grandTotal = subtotal1 + taxTotal - discount;
        var subtotal = subtotal1 - discount;

        $(".grand_total").text(currency_formate(grandTotal));
        $(".sub_total").text(currency_formate(subtotal));

        $("#apply-discount").addClass("d-none");
        $("#remove-discount").removeClass("d-none");
        $("#discount-input").prop("disabled", true);
      },
      error: function(xhr) {
        console.error("An error occurred:", xhr.responseText);
      }
    });
  } else {
    toastr.error("Please enter a valid discount amount");
  }
});

$(document).ready(function() {
  $("#remove-discount").on("click", function() {
    $.ajax({
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
      },
      url: removediscounturl, // Ensure this is the correct URL for your endpoint
      method: "POST",
      success: function(response) {
        // Update UI to reflect discount removal
        $("#discount_amount").text(currency_formate(0)); // Set discount amount to 0

        // Recalculate totals assuming no discount
        var subtotal1 =
          parseFloat($(".sub_total1").text().replace(/[^0-9.-]+/g, "")) || 0;
        var taxTotal =
          parseFloat(
            $(".tax-rate").toArray().reduce(function(total, element) {
              return (
                total + parseFloat($(element).text().replace(/[^0-9.-]+/g, ""))
              );
            }, 0)
          ) || 0;

        var grandTotal = subtotal1 + taxTotal;
        $(".grand_total").text(currency_formate(grandTotal));
        $(".sub_total").text(currency_formate(subtotal1));
        $("#discount-input").val(0);

        // Show Apply Discount button and hide Remove Discount button
        $("#apply-discount").removeClass("d-none");
        $("#remove-discount").addClass("d-none");
        $("#discount-input").prop("disabled", false);
      },
      error: function(xhr) {
        console.error("An error occurred:", xhr.responseText);
      }
    });
  });
});
