function bring_card_to_view(div_id) {
    // console.log('from bring card to view' , div_id);
    $(".no-border").css({"border-style": "none"})
    $("#" + div_id).css({"border": "2px solid rgb(5, 29, 77)"})
    let offset = $("#" + div_id).offset().top - 120
    $('html, body').animate({
        scrollTop: offset
    }, 800);

}
// window.showme = function (index) {
//     ('@@@@@@@ from diff file')
//     // console.log('window.markers', window.markers);
//     // console.log('logging----------1111111111111111111111111111', index)
//     if (window.markers[index].getAnimation() != google.maps.Animation.BOUNCE) {
//         window.markers[index].setAnimation(google.maps.Animation.BOUNCE);
//     } else {
//         window.markers[index].setAnimation(null);
//     }
// }
// $(".partial-card-data").hover(
//     function () {
//         ('@@@@@@@ from diff file')
//         console.log('this.id', this.id);
//         let hover_id=(this.id).split("-")[1];
//         let center = location_mapping[hover_id];
//         if (center)
//         {map.panTo(center);}
//         console.log('herrrrrrrrrrrrrreeeeeeeeeeeee')
//         var indx = (this.id).split("_")[0];
//         window.showme(indx)
        
//     }, function () {
//     }
// );
// console.log('from map support@@@@@@@@')