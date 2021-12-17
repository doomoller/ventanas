<?php

require_once 'sitio/src/AppBase.php';

/*
	Gestiona las ventanas en Backend.
    No hay un tipo definido para las ventanas, aquí se proporciona una forma general básica 
    donde se guardan como una string separado por #. Eje 1#vista#usuarios#0
        primero:    el id de usuario
        segundo:    el tipo de ventana, o sea, tipo de controlador de ventana
        tercero:    el objeto del contenido
        cuarto:     un parametro multipropocito, eje, id de usuario a mostrar o id de vista

    Los objetos de contenido y sus opciones para crear las ventanas se proporcionan como ejemplo
    en los metodos "describir" y "opciones" enrutados a ésta clase, pero usted puede hacerlo
    como guste.
*/
class Ventanas extends AppBase
{
    function __construct($main)
    {
        parent::__construct($main);
        $this->metas = new Meta();
        $this->metas->setTitle("Página Ventanas.");
    }
    public function verAction()
    {   
        // si hay ventanas guardadas se cargan al presentar el escritorio
        $data = array('ventanas' => array());
        $data['ventanas'][] = '1#registro#usuarios#1';
        $data['ventanas'][] = '1#vista#usuarios#0';
        return $this->view("sitio/layouts/ventanas.phtml", $data, $this->metas, "sitio/views/ventanas/ventanas.phtml");
    }
    public function guardarAction()
    {   
        $data = array(
            "estado"    => 'exito',
            "msg"		=> "",
        );
        
        $request = $this->main->getRequest();

	    if($request->isPost())  
	    {
	        $post = $request->getMetodoParametros();
			
	
	    }

        return $this->view("sitio/layouts/ventanas.phtml", $data, $this->metas, "sitio/views/general.phtml");
    }
    public function borrarAction()
    {   
        $data = array(
            "estado"    => 'exito',
            "msg"		=> "",
        );
        
        $request = $this->main->getRequest();

	    if($request->isPost())  
	    {
	        $post = $request->getMetodoParametros();
	        
	    }

        return $this->view("sitio/layouts/ventanas.phtml", $data, $this->metas, "sitio/views/general.phtml");
    }

    public function describirAction()
    {
        $partial = "sitio/views/general.phtml";
		$data = array('msg' => '', 'estado' => 'exito');

		$req = $this->main->getRequest();

		if($req->getQueryParam("o") != null)
		{
            $o = $req->getQueryParam("o");
			$this->metas->setTitle("Detalles de ".$o);

            $data['objetos'] = array();
            $data['objetos']['usuarios']['campos'] = array(
                    'id'            => array(
                                        'etiqueta'=>'ID',
                                    ),
                    'nombre'       => array(
                                        'etiqueta'=>'Nombre',
                                    ),
                    'apellido'     => array(
                                        'etiqueta'=>'Apellido',
                                    ),
                    'correo'            => array(
                                        'etiqueta'=>'Correo',
                                    )
                    );

		}
		else
		{
            $data['estado'] = 'error';
            $data['msg'] = 'Parametro inexistente.';
		}

		return $this->view("sitio/layouts/default.phtml", $data, $this->metas, $partial);
    }
    // para la API
    public function opcionesAction()
    {
        $partial = "sitio/views/general.phtml";
		$data = array('msg' => '', 'estado' => 'exito');

		$req = $this->main->getRequest();

		if($req->getQueryParam("o") != null)
		{
            $o = $req->getQueryParam("o");
			$this->metas->setTitle("Opciones de ".$o);

            $data['objeto'] = $o;

            $data['opciones'] = array();
            $data['opciones'][1] = 'Carlos';
            $data['opciones'][2] = 'Gustavo';
            $data['opciones'][3] = 'Federico';
            $data['opciones'][4] = 'Susana';
            $data['opciones'][5] = 'Maria';
            $data['opciones'][6] = 'Tereza';
            $data['opciones'][7] = 'Julio';
            $data['opciones'][8] = 'Juan';
            $data['opciones'][9] = 'Beatriz';
            $data['opciones'][10] = 'Vanesa';
            $data['opciones'][11] = 'Hector';
            $data['opciones'][12] = 'Damian';
            }
		else
		{
            $data['estado'] = 'error';
            $data['msg'] = 'Parametro inexistente.';
		}

		return $this->view("sitio/layouts/default.phtml", $data, $this->metas, $partial);
    }    

}