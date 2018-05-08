odoo.define('pos_rest.order_kitchen', function (require) {
"use strict";

var core = require('web.core');
var screens = require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var ActionpadWidget = screens.ActionButtonWidget;
var ScreenWidget = screens.ScreenWidget;
var rpc = require('web.rpc');
var QWeb = core.qweb;
var PosBaseWidget = require('point_of_sale.BaseWidget');

var KitchenScreen = ScreenWidget.extend({
    template: 'KitchenScreen',
    previous_screen: 'products',
    events: _.extend({}, ScreenWidget.prototype.events, {
        'click .kitchen_state_change': 'kitchen_change'
    }),
    renderElement: function(){
      var self = this;
      this._super();
      var self = this;
      var linewidget;
      rpc.query({
                model: 'pos.order',
                method: 'search_kitchen_state',
            }).then(function (result) {
                for(var i = 0; i < result.length; i++){
                    var line = result[i];
                    linewidget = $(QWeb.render('KitchenOrderline',{ 
                        widget:self,
                        line: line,
                    }));
                    linewidget.data('id',line);
                    self.$('.line_kitchen').append(linewidget);
                }
            });
      this.$('.back').click(function(){
            self.gui.show_screen(self.previous_screen);
        });
      this.$('.next').click(function(){
            self.gui.show_screen('RecallScreen');
        });
      
    },
    kitchen_change : function (ev) {
         var $input = $(ev.target),
             cid = $input.attr('data-id');
         rpc.query({
                    model: 'pos.order',
                    method: 'move_next',
                    args: [parseInt(cid, 10)],
                })              
         this.renderElement();
         this.getParent().screens.RecallScreen.renderElement();      
    },
});

gui.define_screen({
    'name': 'kitchenscreen', 
    'widget': KitchenScreen,
    
});

var KitchenOrderline = PosBaseWidget.extend({
    template:'KitchenOrderline',  
});

var KitchenButton = ActionpadWidget.extend({
    template: 'KitchenButton',
    button_click: function(){
    	this.gui.show_screen('kitchenscreen'); 
    },
});
screens.define_action_button({
    'name': 'KitchenButton',
    'widget': KitchenButton,
    
});

return {
    KitchenButton: KitchenButton,
    KitchenOrderline:KitchenOrderline,
    KitchenScreen:KitchenScreen,
    
};

});