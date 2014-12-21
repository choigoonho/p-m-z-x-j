$(function () {
  $('a.menu-item').hover(
    $.debounce(300, true, function () {
      $(this).siblings('.sub-menu').removeClass('hidden');
    }),
    $.debounce(300, false, function () {
      var submenu = $(this).siblings('.sub-menu');
      if (!submenu.data('open')) {
        submenu.addClass('hidden');
      }
      submenu.data('open', false);
    })
  );
  $('.sub-menu').hover(
    function () {
      $(this).data('open', true);
      $(this).removeClass('hidden');
    },
    $.debounce(300, false, function () {
      $(this).data('open', false);
      $(this).addClass('hidden');
    })
  );
});
