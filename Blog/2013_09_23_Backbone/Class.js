(function(){
    var SomeClass = function(){
        this.id = 0;
        this.name = 'name of instance';
    };

    SomeClass.extend = function(options){
        return function(){
            var elt = new SomeClass();
            for(var i in options){
                elt[i] = options[i];
            }
            return elt;
        }
    };

    var instance  = new SomeClass();

    var SomeClass2 = SomeClass.extend({desc:'description', log:function(){console.log(this);}});
    var instance2  = new SomeClass2();

    instance2.log();
})();