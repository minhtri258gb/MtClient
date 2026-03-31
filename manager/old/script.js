var mt = {

	// Forward
	init: function() {
		this.c_tab.init();
	},

	// Component
	c_tab: {
		component: null,
		init: function() {
			this.component = $('#tab');
		},
		addAnime: function() {
			this.component.tabs('add', {
				title: 'Anime',
				href: '/manager/anime.html',
				closable: true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
		addFilm: function() {
			this.component.tabs('add', {
				title:'Film',
				href: '/manager/film.html',
				closable:true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
		addMovie: function() {
			this.component.tabs('add', {
				title:'Movie',
				href: '/manager/movie.html',
				closable:true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
		addManga: function() {
			this.component.tabs('add', {
				title:'Manga',
				href: '/manager/manga.html',
				closable:true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
		addGame: function() {
			this.component.tabs('add', {
				title:'Game',
				href: '/manager/game.html',
				closable:true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
		addAccount: function() {
			this.component.tabs('add', {
				title:'Account',
				href: '/manager/account.html',
				closable:true,
				tools:[{
					iconCls:'icon-key',
					handler:function(){
						alert('refresh');
					}
				}]
			});
		},
	},

};
