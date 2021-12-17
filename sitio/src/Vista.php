<?php
require_once 'sitio/src/Request.php';
require_once 'sitio/src/DB.php';

class Vista 
{
    public string $nombre = "";
    public array $campos;
    public array $cabeceras;   
    public string $formula = "";
    public string $objeto = "";
    public DB $db;
    public array $datos;        // objeto a listar, debe implementar iVista para fomatear los datos

    public int $pagina = 0;
    public int $paginado = 10;
    public int $paginas = 1;
    public string $orden = "";
    public bool $desc = false;
    public string $link = "";

    public function __construct(string $_nombre, string $_campos, $_formula, string $_objeto, DB $_db)
    {
        $this->nombre = $_nombre;
        $this->campos = explode(",", $_campos);
        $this->formula = $_formula;
        $this->objeto = $_objeto;
        $this->db = $_db;
        $this->datos = array();

    }
    public function procesar(Request $req)
    {
        $this->link = $req->getUri();
        $this->pagina = $req->getQueryParam('p', 0);
        $this->paginado = 20;
        $this->orden = $req->getQueryParam('o', 'id');
        if(!in_array($this->orden, $this->campos))$this->orden = "id";
        $this->desc = $req->getQueryParam('desc') != null;

        
        $this->paginas = 2;
        $this->campos = array('id', 'nombre', 'apellido', 'correo');
        $this->cabeceras = array('id' => 'ID', 'nombre' => 'Nombre', 'apellido' => 'Apellido', 'correo' => 'Correo');

        $this->datos = array();
        if($this->pagina == 0)
        {
        $this->datos[] = array('id' => '1', 'nombre' => 'Carlos', 'apellido' => 'Kartz', 'correo' => 'carloskartz@test.dummy');
        $this->datos[] = array('id' => '2', 'nombre' => 'Gustavo', 'apellido' => 'Gomez', 'correo' => 'gustavo8282@test.dummy');
        $this->datos[] = array('id' => '3', 'nombre' => 'Federico', 'apellido' => 'Perez', 'correo' => 'federico382193@test.dummy');
        $this->datos[] = array('id' => '4', 'nombre' => 'Susana', 'apellido' => 'Rodriguez', 'correo' => 'susana3232@test.dummy');
        $this->datos[] = array('id' => '5', 'nombre' => 'Maria', 'apellido' => 'Suarez', 'correo' => 'maria3232@test.dummy');
        $this->datos[] = array('id' => '6', 'nombre' => 'Tereza', 'apellido' => 'Olivera', 'correo' => 'tereza3232@test.dummy');
        $this->datos[] = array('id' => '7', 'nombre' => 'Julio', 'apellido' => 'Massino', 'correo' => 'julio232@test.dummy');
        $this->datos[] = array('id' => '8', 'nombre' => 'Juan', 'apellido' => 'Bentancour', 'correo' => 'juan23232@test.dummy');
        $this->datos[] = array('id' => '9', 'nombre' => 'Beatriz', 'apellido' => 'Vera', 'correo' => 'beatriz53453@test.dummy');
        $this->datos[] = array('id' => '10', 'nombre' => 'Vanesa', 'apellido' => 'Garcia', 'correo' => 'vanesa43423@test.dummy');
        }
        else if($this->pagina == 1)
        {
        $this->datos[] = array('id' => '11', 'nombre' => 'Hector', 'apellido' => 'Frank', 'correo' => 'hector3232@test.dummy');
        $this->datos[] = array('id' => '12', 'nombre' => 'Damian', 'apellido' => 'Kal', 'correo' => 'damian2312@test.dummy');
        }
    }
 
}

