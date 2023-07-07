var mt = {
  apps: [],
  init: function() {

    // Init packgrid
    mt.pg = $('#packgrid').packery({
      itemSelector: '.pgi',
      gutter: 10,
      columnWidth: 100,
      rowHeight: 100,
    });
    mt.pg.on('click', '.pgi', (event) => {
      if ($(event.currentTarget).hasClass('pgis')) {
        window.location.href = "/"+$(event.currentTarget).html();
      } else {
        $('.pgis').removeClass('pgis');
        $(event.currentTarget).toggleClass('pgis');
        mt.pg.packery('layout');
        // pg.packery('shiftLayout');
      }
    });

    // Get list app
    $.ajax({
      type: 'GET',
      url: '/common/getListApplication',
      success: (res) => {
        mt.apps = res;
        // Add app to packgrid
        for (let i in res) {
          let cell = $('<div class="pgi">'+res[i]+'</div>');
          let type = Math.floor(Math.random() * 4) + 1;
          switch (type) {
            case 2: cell.addClass('pgimh'); break;
            case 3: cell.addClass('pgimw'); break;
            case 4: cell.addClass('pgimh'); cell.addClass('pgimw'); break;
          }
          mt.pg.append(cell).packery('appended', cell);

        }
      },
    });

  },
}