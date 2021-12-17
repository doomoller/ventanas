
function Controlador(_tipo, _objeto, _param)
{
    this.tipo = _tipo;
    this.objeto = _objeto;
    this.param = _param;
    this.estado = "";
    this.msg = "";
    this.ajax = new AjaxObjeto();
    this.ajax_inicio = 0;
    this.contenedor = document.createElement('div');
    this.contenedor.setAttribute('class', 'cont-inter-v');
    this.data = {};
    this.ventana = null;
}
Controlador.prototype.asignarVentana = function(v)
{  
    this.ventana = v;
}
Controlador.prototype.obtContenedor = function()
{  
    return this.contenedor;
}
// para sobreescribir
Controlador.prototype.construirContenido = function()
{
    this.contenedor.innerHTML = '';
    this.contenedor.appendChild(document.createTextNode("Error: contenido base."));
}
Controlador.prototype.actualizar = function()
{
    
    if(this.estado == "Cargado")
    {
        
    }
    else if(this.estado == "Error")
    {
        this.contenedor.innerHTML = '';
        this.contenedor.appendChild(document.createTextNode(this.msg));
    }
    else
    {
        this.contenedor.innerHTML = '';

        var img = document.createElement('img');
        img.setAttribute('src', '/img/cargando.gif');
        this.contenedor.appendChild(document.createTextNode(this.msg));
        this.contenedor.appendChild(img);
    }

}
Controlador.prototype.cargar = function()
{
    
    this.estado = "Cargando";
    this.msg = "Preparando...";

    this.ajax_inicio = Date.now();
    this.ajax.onreadystatechange = (this.comprobarCarga).bind(this);

    var conf = this.cargarConfig();
    //console.log('ajax: '+conf.url);

    this.ajax.open(conf.metodo, conf.url, true);
    this.ajax.send(conf.datos);	
}
Controlador.prototype.comprobarCarga = function()
{
    if(this.ajax.readyState == 4)
    {
        //console.log(this.ajax.responseText);
        var j = JSON.parse(this.ajax.responseText);
		if(this.ajax.status == 200 && j['estado'] == 'exito')
		{
			this.estado = "Cargado";
            this.msg = "";
            this.data = j;
            this.construirContenido();
            this.actualizar();
            if(this.ventana != null)
            {
                this.ventana.ajustarContenidoVentana();
                this.ventana.actualizar();
            }
		}
		else
		{
            console.info("Error en la respuesta ajax.");
            console.info(this.ajax.responseText);
            console.info(j['msg']);
            this.estado = "Error";
			this.msg = j['msg'];
		}
    }
    else if(this.ajax.readyState == 3)
    {
        this.msg == 'Obteniendo datos... ('+ (Date.now() - this.ajax_inicio) +')';
    }
    else
    {
        this.msg == 'Enviando consulta...('+ (Date.now() - this.ajax_inicio) +')';
    }

    if(Date.now() - this.ajax_inicio > 30000)
    {
        console.info("Demora en ajax");
        this.estado = "Error";
        this.msg = 'Parece que no hay respuesta. Intentelo nuevamente.';
    }
}
// @override para sobreescribir
Controlador.prototype.cargarConfig = function()
{
    return {
        csrf : obtenerCSRF()
    };
}

function ControladorVista(_tipo, _objeto, _param)
{
    Controlador.call(this, _tipo, _objeto, _param);
    this.orden = '';
    this.desc = false;
    this.pagina = 0;

}
ControladorVista.prototype = Object.create(Controlador.prototype);
ControladorVista.prototype.constructor = ControladorVista;
ControladorVista.prototype.cargarConfig = function()
{
    c = {
        datos : "&csrf="+encodeURIComponent(obtenerCSRF()),
        metodo : 'GET',
        url : "/api/"+this.objeto+"/listado?"+(this.param == 'vista' ? '' : 'vid=' + this.param),
    };
    if(this.data != undefined && this.data.vista != undefined)
    {
        c.url += '&p='+this.pagina;
        c.url += '&o='+this.orden;
        c.url += this.desc ? '&desc=1' : '';
    }
    return c;
}
ControladorVista.prototype.construirContenido = function()
{
    this.orden = this.data.vista.orden;
    this.desc = this.data.vista.desc;

    var vistas = document.createElement("select");
    vistas.setAttribute("class", "stdcontrol");
    vistas.addEventListener("change", (e) => {
        this.param = e.target.value;
        this.pagina = 0;
        this.orden = '';
        this.desc = false;
        this.cargar();
    });
    for(v = 0; v < this.data.vistas_opciones.length; v++)
    {
        op = document.createElement("option");
        op.setAttribute('value', v);
        if(this.data.vid == v)op.setAttribute('selected', '');
        op.appendChild(document.createTextNode(this.data.vistas_opciones[v]));
        vistas.appendChild(op);
    }
   
    this.contenedor.innerHTML = '';
    this.contenedor.appendChild(crearVistaTabla(this, this.data.vista, vistas));
    this.ventana.ponerTitulo('Vista de '+this.objeto);
}



function ControladorRegistro(_tipo, _objeto, _param, _edicion)
{
    Controlador.call(this, _tipo, _objeto, _param);
    this.edicion = _edicion;  // ver o editar

}
ControladorRegistro.prototype = Object.create(Controlador.prototype);
ControladorRegistro.prototype.constructor = ControladorRegistro;
ControladorRegistro.prototype.cargarConfig = function()
{
    c = {
        datos : "&csrf="+encodeURIComponent(obtenerCSRF()),
        metodo : this.edicion ? 'POST' : 'GET',
        url : "/api/"+this.objeto+"/"+(this.edicion ? "editar" : "ver")+"?id=" + this.param,
    };
    return c;
}
ControladorRegistro.prototype.construirContenido = function()
{
    var cont = document.createElement('div');
    this.contenedor.innerHTML = '';
    var _titulo = (this.data.datos['nombre'] != undefined ? this.data.datos['nombre'] : '') + (this.data.datos['apellido'] != undefined ? ' ' + this.data.datos['apellido'] : '');

    cont.setAttribute('class', 'v-detalles');

    if(this.edicion)  // formulario para editar
    {

    }
    else   // vista del registro
    {
        for(c = 0; c < this.data.campos.length; c++)
        {
            campo = this.data.campos[c];

            if(this.data.datos[campo] == undefined || this.data.datos[campo] == null || this.data.datos[campo] == '') continue;

            item = document.createElement('div');
            item.setAttribute('class', 'item');

            etiq = undefined;
            valor = undefined;

            etiq = document.createElement('div');
            etiq.setAttribute('class', 'campo');
            etiq.appendChild(document.createTextNode(this.data.etiqueta[campo]));

            valor = document.createElement('div');
            valor.setAttribute('class', 'valor');
            valor.appendChild(document.createTextNode(this.data.datos[campo]));
        
            
            if(etiq != undefined)item.appendChild(etiq);
            item.appendChild(valor);
            cont.appendChild(item);
        }    
    }

    var editar = document.createElement("div");
    editar.setAttribute("class", "boton");
    editar.appendChild(document.createTextNode(this.edicion ? 'Ver' : 'Editar'))
    editar.addEventListener("click", (e) => {
        this.edicion = !this.edicion;
        this.construirContenido();
    });
    cont.appendChild(editar);

    this.contenedor.appendChild(cont);
    if(_titulo == '')
    {
        _titulo = 'Detalles de '+this.objeto;
    }
    this.ventana.ponerTitulo(_titulo);
}

function Ventana(_controlador, _escritorio, _guardada)
{
    this.titulo = '';
    this.controlador = _controlador;
    this.escritorio = _escritorio;
    this.guardada = _guardada;
    this.ajax = new AjaxObjeto();
    this.ajax_inicio = 0;

    this.estado = 'normal';

    this.controlador.asignarVentana(this);

    this.caja = {x : 0.0, y : 0.0, w : 0.0, h : 0.0};

    this.v = document.createElement('div');
    this.v_cabecera = document.createElement('div');
    this.v_contenido = document.createElement('div');
    this.v_drag = document.createElement('div');
    this.v_titulo = document.createElement('div');
    this.v_cerrar = document.createElement('div');
    this.v_min = document.createElement('div');
    this.v_max = document.createElement('div');
    
    this.v_drag.appendChild(document.createTextNode("✥"));
    this.v_cerrar.appendChild(document.createTextNode("×"));
    this.v_min.appendChild(document.createTextNode("-"));
    this.v_max.appendChild(document.createTextNode("+"));
    this.v_titulo.appendChild(document.createTextNode(this.titulo));

    this.v.setAttribute('class', 'ventana');
    this.v_cabecera.setAttribute('class', 'cabecera');
    this.v_contenido.setAttribute('class', 'contenido');
    this.v_drag.setAttribute('class', 'drag-punto');
    this.v_titulo.setAttribute('class', 'titulo');
    this.v_cerrar.setAttribute('class', 'btn');
    this.v_min.setAttribute('class', 'btn');
    this.v_max.setAttribute('class', 'btn');
    this.v_cerrar.setAttribute('id', 'cerrar');
    this.v_min.setAttribute('id', 'min');
    this.v_max.setAttribute('id', 'max');

    this.v_cabecera.appendChild(this.v_drag);
    this.v_cabecera.appendChild(this.v_titulo);
    this.v_cabecera.appendChild(this.v_cerrar);
    this.v_cabecera.appendChild(this.v_min);
    this.v_cabecera.appendChild(this.v_max);

    this.v.appendChild(this.v_cabecera);
    this.v.appendChild(this.v_contenido);

    this.v_drag.setAttribute("draggable", true);
    this.v_drag.addEventListener("dragstart", (this.arrastrar).bind(this));
    this.v_drag.addEventListener("dragend", (this.arrastrar).bind(this));


    this.v_cerrar.onclick = this.cerrar.bind(this);
        
    this.v_min.style.display = 'block';
    this.v_min.onclick = this.minimizar.bind(this);

 
    this.v_max.style.display = 'none';
    this.v_max.onclick = this.restaurar.bind(this);
    
}
Ventana.prototype.cerrar = function()
{
    this.borrar();
    this.v.remove();
    this.escritorio.borrar(this);
}
Ventana.prototype.minimizar = function()
{
    this.v.style.resize = 'none';
    this.v.style.height = 'auto';
    this.v_contenido.style.display = 'none'
    this.v_min.style.display = 'none';
    this.v_max.style.display = 'block';
    this.estado = 'min';
}
Ventana.prototype.restaurar = function()
{
    this.v.style.resize = 'both';
    this.v_contenido.style.display = 'block'
    this.v_min.style.display = 'block';
    this.v_max.style.display = 'none';
    this.estado = 'normal';
}
Ventana.prototype.ponerTitulo = function(t)
{
    this.titulo = t;
    this.v_titulo.innerHTML = '';
    this.v_titulo.appendChild(document.createTextNode(this.titulo));
}
Ventana.prototype.calcularCaja = function()
{
    this.caja = {
        x: parseFloat(window.getComputedStyle(this.v).left),
        y: parseFloat(window.getComputedStyle(this.v).top),
        w: parseFloat(window.getComputedStyle(this.v).width),
        h: parseFloat(window.getComputedStyle(this.v).height)
    };
}
Ventana.prototype.ajustarContenidoVentana = function()
{
    this.v.style.width = 'fit-content';
    this.v.style.height = 'fit-content';
}
Ventana.prototype.ajustarVentana = function()
{

    this.calcularCaja();

    if(this.caja.x > window.innerWidth - 10)this.caja.x = window.innerWidth - 10;
    if(this.caja.y > window.innerHeight - 50)this.caja.y = window.innerHeight - 50;

    if(this.caja.w > window.innerWidth - 20)this.caja.w = window.innerWidth - 20;
    if(this.caja.h > window.innerHeight - 50)this.caja.h = window.innerHeight - 50;

    if(this.caja.x + this.caja.w > window.innerWidth)this.caja.x = window.innerWidth - this.caja.w;
    if(this.caja.y + this.caja.h > window.innerHeight)this.caja.y = window.innerHeight - this.caja.h;

    if(this.caja.x < 10)this.caja.x = 10;
    if(this.caja.y < 50)this.caja.y = 50;

    this.v.style.left = this.caja.x + 'px';
    this.v.style.top = this.caja.y + 'px';
    if(this.estado == 'normal')
    {
        this.v.style.width = this.caja.w + 'px';
        this.v.style.height = this.caja.h + 'px';
    }
   
}
Ventana.prototype.arrastrar = function(e)
{
    switch(e.type)
    {
        case 'dragstart':
            this.v.style.opacity = '0.4';
        break;
        case 'dragend':
            this.v.style.opacity = '1.0';
            x = e.x;
            y = e.y;

            if(x < 10)x = 10;
            else if(x > window.innerWidth - 10)x = window.innerWidth - 10;

            if(y < 50)y = 50;
            else if(y > window.innerHeight - 50)y = window.innerHeight - 50;

            this.v.style.left = x+'px';
            this.v.style.top = y+'px';
            this.escritorio.asginarFoco(this.v);
            this.actualizar();
        break;
        case 'dragenter':break;
        case 'dragover':
            if (e.preventDefault)e.preventDefault();
            return false;
        break;
        case 'dragleave':break;
        case 'drag': break;
        case 'drop':
            e.stopPropagation(); 
            return false;
        break;
    }
}
Ventana.prototype.formarEstadoGrafico = function()
{
    return JSON.stringify({caja:this.caja,estado:this.estado});
}
Ventana.prototype.animar = function()
{
    if(this.controlador.estado == "Cargado")
    {
        this.v.style.border = 'solid 1px #213ed2';
    }
    else if(this.controlador.estado == "Error")
    {
        this.v.style.border = 'solid 1px #f33';
    }
    else if(this.controlador.estado == "Cargando")
    {
        this.v.style.border = 'solid 1px #444';
    }
}
Ventana.prototype.actualizar = function()
{
    if(this.controlador.estado == "Cargando")
    {
        this.controlador.actualizar();
        setTimeout((this.actualizar).bind(this), 1000);
    }
    this.ajustarVentana();
    this.guardar();
}
Ventana.prototype.cargar = function()
{
    this.controlador.cargar();
    this.v_contenido.appendChild(this.controlador.obtContenedor());
    this.actualizar();
}

Ventana.prototype.guardar = function()
{
    if(this.guardada == false)
    {
        console.info("Guardada ventana: "+this.titulo);
        this.ajax_inicio = Date.now();
        this.ajax.onreadystatechange = (this.comprobarGuardar).bind(this);
        
        this.ajax.open('POST', '/api/ventanas/guardar', true);
        this.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        this.ajax.send("&csrf="+encodeURIComponent(obtenerCSRF())+
                        "&tipo="+encodeURIComponent(this.controlador.tipo)+
                        "&objeto="+encodeURIComponent(this.controlador.objeto)+
                        "&param="+encodeURIComponent(this.controlador.param)+
                        "&estado="+encodeURIComponent(this.formarEstadoGrafico()));	
    }
    
}
Ventana.prototype.comprobarGuardar = function()
{
    if(this.ajax.readyState == 4)
    {
        this.guardada = true;
        //console.log(this.ajax.responseText);
        var j = JSON.parse(this.ajax.responseText);
		if(this.ajax.status == 200 && j['estado'] == 'exito')
		{
            console.info("Ventana guardada con exito");
		}
		else
		{
            console.info("Error en la respuesta ajax.");
            console.info(this.ajax.responseText);
		}
    }
    else if(this.ajax.readyState == 3)
    {
        console.info('Obteniendo datos... ('+ (Date.now() - this.ajax_inicio) +')');
    }
    else
    {
        console.info('Enviando consulta...('+ (Date.now() - this.ajax_inicio) +')');
    }

    if(Date.now() - this.ajax_inicio > 30000)
    {
        console.info("Demora en ajax Guardar");
    }
}
Ventana.prototype.borrar = function()
{
    this.ajax_inicio = Date.now();
    this.ajax.onreadystatechange = function(a){console.log(a)};
    
    this.ajax.open('POST', '/api/ventanas/borrar', true);
    this.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    this.ajax.send("&csrf="+encodeURIComponent(obtenerCSRF())+
                    "&tipo="+encodeURIComponent(this.controlador.tipo)+
                    "&objeto="+encodeURIComponent(this.controlador.objeto)+
                    "&param="+encodeURIComponent(this.controlador.param));	
}
Ventana.prototype.esHijo = function(e)
{
    var parent = e.parentNode;
    while(parent != null)
    {
        if(parent === this.v)return true;
        parent = parent.parentNode;
    }
    return false;
}
function Escritorio(_id, _agregar)
{
    this.id = _id;
    this.agregar = _agregar;
    this.e = document.getElementById(this.id);
    this.btn_agregar = document.getElementById(this.agregar);
    this.menu = document.getElementById(this.agregar + '-menu');
    this.menu_msg = document.getElementById(this.agregar + '-msg');
    this.menu_espera = document.getElementById(this.agregar + '-espera');
    this.menu_form = document.getElementById(this.agregar + '-form');
    this.menu_sec_tipo = document.getElementById(this.agregar + '-sec-tipo');
    this.menu_sec_objeto = document.getElementById(this.agregar + '-sec-objeto');
    this.menu_sec_param = document.getElementById(this.agregar + '-sec-param');
    this.menu_tipo = document.getElementById(this.agregar + '-tipo');
    this.menu_objeto = document.getElementById(this.agregar + '-objeto');
    this.menu_param = document.getElementById(this.agregar + '-param');
    this.menu_objeto_espera = document.getElementById(this.agregar + '-objeto-espera');
    this.menu_param_espera = document.getElementById(this.agregar + '-param-espera');
    this.menu_btn_crear = document.getElementById(this.agregar + '-btn-crear');

    this.cargador_datos = null;

    this.ventanas = [];
    if(this.e == undefined)
    {
        console.error("No se puede encontrar el escritorio: "+id);
        return;
    }
    if(this.btn_agregar == undefined)
    {
        console.error("No se puede encontrar el botón para agregar ventanas: "+agregar);
        return;
    }
    if(this.menu == undefined)
    {
        console.error("No se puede encontrar el menu de ventanas. ");
        return;
    }
    this.btn_agregar.addEventListener('click', (this.mostrarOcultarCreadorVentanas).bind(this));
    ocultar(this.menu);

    /*
    *  Ventanas guardadas como una cadena en clave deparada por #. Eje: Tipo#Objeto#Parametro
    */
    if(ventanas_usuario != undefined)
    {
        for(v = 0; v < ventanas_usuario.length; v++)
        {
            t = ventanas_usuario[v].split('#');
            if(t.length == 4)
            {
                this.crearVentana(t[1], t[2], t[3], true);
            }
        }
    }

}
Escritorio.prototype.crearVentana = function(_tipo, _obj, _param, _guardada = false)
{
    contr = null;
    if(_tipo == 'vista') contr = new ControladorVista(_tipo, _obj, _param);
    if(_tipo == 'registro') contr = new ControladorRegistro(_tipo, _obj, _param);
    if(contr == null)
    {
        console.error("Tipo de ventana desconocido: "+_tipo);
        return;
    }
    nueva = new Ventana(contr, this, _guardada);
    nueva.cargar();
    this.e.appendChild(nueva.v);
    nueva.v.style.zIndex = this.ventanas.length;
    nueva.v.addEventListener('click', ((v) =>
    {
        this.asginarFoco(v.target);
    }).bind(this));

    this.ventanas.push(nueva);
    this.asginarFoco(nueva.v);
}
Escritorio.prototype.mostrarOcultarCreadorVentanas = function(e)
{
    if(this.menu.style.display == 'none')
    {
        this.menu.style.display = 'block';
        this.controlarCreadorVentanas();
    }
    else
    {
        this.menu.style.display = 'none';
    }
}
Escritorio.prototype.iniciarCambioVentana = function(e)
{
    var _tipo = this.menu_tipo.value;
    var _objeto = this.menu_objeto.value;
    var _param = this.menu_param.value;
    ocultar(this.menu);
    this.crearVentana(_tipo, _objeto, _tipo == 'vista' ? 'vista' : _param);
    e.stopPropagation();
}
Escritorio.prototype.cambioSelectTipo = function(e)
{
    this.cambioSelectObjeto();
}
Escritorio.prototype.cambioSelectObjeto = function(e)
{
    var _tipo = this.menu_tipo.value;
    if(_tipo == 'registro')
    {
        opts = this.cargador_datos.opcionesObjeto(this.menu_objeto.value);
        if(opts == null)
        {
            this.cargador_datos.cargarOpciones(this.menu_objeto.value);
            this.controlarCreadorVentanas();
        }
        else
        {
            mostrar(this.menu_sec_param);
            ocultar(this.menu_param_espera);
            vaciarSelect(this.menu_param);
            for(o in opts)
            {
                opt = document.createElement('option');
                opt.setAttribute('value', o);
                opt.appendChild(document.createTextNode(opts[o]));
                this.menu_param.appendChild(opt);
            }
        }
    }
    else
    {
        ocultar(this.menu_sec_param);
    }
}
Escritorio.prototype.controlarCreadorVentanas = function()
{
    if(this.cargador_datos == null)
    {
        mostrar(this.menu_espera);
        ocultar(this.menu_form);
        this.cargador_datos = new AppObjetos();
        setTimeout((this.controlarCreadorVentanas).bind(this), 1000);
        return;
    }
    else if(this.cargador_datos.estado == 'error')
    {
        alert("Error al cargar. Intentelo nuevamente. "+this.cargador_datos.msg);
        this.menu.style.display = 'none';
        return;
    }
    else if(this.cargador_datos.estado == 'cargado')
    {
        ocultar(this.menu_espera);
        mostrar(this.menu_form);
        ocultar(this.menu_objeto_espera);

        if(this.menu_objeto.options.length == 0)
        {
            objetos = this.cargador_datos.listarObjetos();
            for(i = 0; i < objetos.length; i++)
            {
                opt = document.createElement('option');
                opt.setAttribute('value', objetos[i].id);
                opt.appendChild(document.createTextNode(objetos[i].etiqueta));
                this.menu_objeto.appendChild(opt);
            }    
        }

        this.menu_tipo.onchange = this.cambioSelectTipo.bind(this);
        this.menu_objeto.onchange = this.cambioSelectObjeto.bind(this);
        this.menu_btn_crear.onclick = this.iniciarCambioVentana.bind(this);

        this.cambioSelectObjeto();

    }
    else 
    {
        this.menu_msg.innerText = this.cargador_datos.msg;
        mostrar(this.menu_espera);
        ocultar(this.menu_form);
        setTimeout((this.controlarCreadorVentanas).bind(this), 1000);
        return;
    }
}
Escritorio.prototype.borrar = function(v)
{
    for(i = 0; i < this.ventanas.length; i++)
    {
        if(this.ventanas[i] === v)
        {
            this.ventanas.splice(i,1);
            return;
        }
    }
}
Escritorio.prototype.asginarFoco = function(v)
{
    var indice = 1;
    for(i = 0; i < this.ventanas.length; i++)
    {        
        this.ventanas[i].v.style.zIndex = indice++;
    }
    for(i = 0; i < this.ventanas.length; i++)
    {
        if(this.ventanas[i].v === v || this.ventanas[i].esHijo(v))
        {
            this.ventanas[i].v.focus();
            this.ventanas[i].v.style.zIndex = indice++;
            return;
        }
    }
}
Escritorio.prototype.animar = function()
{
    for(i = 0; i < this.ventanas.length; i++)
    {
        this.ventanas[i].animar();
    }
}
Escritorio.prototype.actualizar = function()
{
    for(i = 0; i < this.ventanas.length; i++)
    {
        this.ventanas[i].actualizar();
    }
}



var esc;

window.addEventListener('load', function() {
    esc = new Escritorio('escritorio', 'agregar-ventana');
    setInterval((esc.animar).bind(esc), 200);
    setTimeout((esc.actualizar).bind(esc), 100);
}, false);

window.onresize = function()
{
    setTimeout((esc.actualizar).bind(esc), 50);
}

function crearVentana(_tipo, _obj, _param)
{
    esc.crearVentana(_tipo, _obj, _param);
}

function crearVistaTabla(refer, vista, otros)
{
    
    var std = document.createElement('div');
    var t = document.createElement('table');
    var head = document.createElement('thead');
    var body = document.createElement('tbody');

    std.setAttribute('class', 'v-std');

    h = document.createElement('div');
    h.setAttribute('class', 'tit');
    h.appendChild(document.createTextNode(vista.nombre));
    std.appendChild(h);

    std.appendChild(otros);

    tr = document.createElement('tr');
    for(campo = 0; campo < vista.campos.length; campo++)
    {
        tmp = document.createElement('th');
        if(vista.campos[campo] == vista.orden)
        {
            tmp.setAttribute('class', 'orden');
            tmp.appendChild(document.createTextNode(vista.desc ? '⇩' : '⇧'));
        }
        aorden = document.createElement('a');
        aorden.setAttribute('rel', vista.campos[campo]);
        aorden.appendChild(document.createTextNode(vista.cabeceras[vista.campos[campo]]));
        aorden.addEventListener("click", ((e) => {
                e.preventDefault();
                refer.pagina = 0;
                refer.desc = refer.orden == e.target.getAttribute('rel') && !refer.desc;
                refer.orden = e.target.getAttribute('rel');
                refer.cargar();
            }).bind(refer)
        );
        tmp.appendChild(aorden);
        tr.appendChild(tmp);
    }
    head.appendChild(tr);

    for(linea = 0; linea < vista.datos.length; linea++)
    {
        tr = document.createElement('tr');
        tr.setAttribute('class', ''+(linea % 2 == 0 ? 'par' : 'impar'))
        for(campo = 0; campo < vista.campos.length; campo++)
        {
            var val = vista.datos[linea][vista.campos[campo]];
            tmp = document.createElement('td');
            if(vista.campos[campo] == 'id')
            {
                nv = document.createElement('a');
                nv.setAttribute('class', 'boton');
                nv.setAttribute('rel', val);
                nv.appendChild(document.createTextNode(val));
                nv.addEventListener("click", ((e) => {       
                        e.preventDefault();                 
                        crearVentana('registro', refer.objeto, e.target.getAttribute('rel'));
                        e.stopPropagation();
                    }).bind(refer)
                );
                tmp.appendChild(nv);
            }
            else
            {
                tmp.appendChild(document.createTextNode(val));
            }
            tr.appendChild(tmp);    
        }
        body.appendChild(tr);
    }

    t.appendChild(head);
    t.appendChild(body);
    std.appendChild(t);
    

    var pie = document.createElement('div');
    pie.setAttribute('class', 'tpie');

    for(i = 0; i < vista.paginas; i++)
    {
        var t;
        if(vista.pagina == i)
        {
            t = document.createElement('span');
            t.appendChild(document.createTextNode("  "+ (i+1) + " "));
        }
        else
        {
            t = document.createElement('a');
            t.setAttribute('rel', i);
            t.appendChild(document.createTextNode(""+(i+1)));
            t.addEventListener("click", ((e) => {
                e.preventDefault();
                refer.pagina = e.target.getAttribute('rel');
                refer.cargar();
            }).bind(refer)
            );
        }
        pie.appendChild(t);
    }
    std.appendChild(pie);
    return std;
}