function bring_card_to_view_v1(div_id) {
    $(".apparment-list-updated").removeClass("highlighted")
    $("#" + div_id).addClass("highlighted")
    let offset = $("#" + div_id).offset().top - 120;
    console.log("offset", offset)
    $('html, body').animate({
        scrollTop: offset
    });
}