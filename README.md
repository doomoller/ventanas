# ventanas
 Crea un entorno de venanas en el navegador. Se proporciona la gestion de la UI con js, y el backend en PHP.

js:

    La clase AppObjetos gestiona la carga de los objetos y sus opciones 
	para mostrar en las ventanas. La clase escritorio crea y gestiona
	las ventanas basado en la información de esta clase.

    La clase Ventana gestiona la UI de ventana, y el contenido lo gestiona
    su controladora que se crea para cada tipo de ventana. Se proporcionan
    2 tipos de controladora, Vista y Registro, y la clase base Controlador.
    La clase ControladorVista muestra una lista de registro en forma de 
    tabla. La clase ControladorRegistro muestra un único registro. 
    Vista también permite crear ventanas de registros únicos desde su tabla.
    Eje, se listan los usuarios en una tabla, y el id de usuario es un
    link para crear una ventana de Registro de ese usuario.

PHP:

    Gestiona las ventanas en Backend.
    No hay un tipo definido para las ventanas, aqui se proporciona una forma general básica 
    donde se guardan como una string separado por #. Eje 1#vista#usuarios#0
        primero:    el id de usuario
        segundo:    el tipo de ventana, o sea, tipo de controlador de ventana
        tercero:    el objeto del contenido
        cuarto:     un parametro multipropocito, eje, id de usuario a mostrar o id de vista

    Los objetos de contenido y sus opciones para crear las ventanas se proporcionan como ejemplo
    en los metodos "describir" y "opciones" enrutados a ésta clase, pero usted puede hacerlo
    como guste.