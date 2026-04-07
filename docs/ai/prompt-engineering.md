  **1º Intenté este prompt y mejoró resultados, pero siguió cambiando las funcionalidades o haciendolas fallar.**
"Quiero que actúes como un asistente de diseño y maquetación web especializado en CSS y diseño de interfaces.
Contexto:
- Estoy trabajando en una app web existente.
- NO debes cambiar la lógica de la app ni la estructura general de los componentes, solo la estética (CSS/estilos).
- La app está construida con: [[especifica aquí si usas HTML plano, React, Vue, etc.]].
- Los estilos actuales están en: [[por ejemplo: styles.css, componentes con CSS-in-JS, Tailwind, etc.]].
Objetivo de diseño:
- Quiero que la estética de mi app se inspire claramente en la web https://advenica.com/
- Respeta la misma paleta de colores base (tonos de azul, acentos, etc.), tipografía y uso de espacios de forma similar.
- PERO quiero que todo se adapte a un MODO OSCURO coherente:
- Fondos oscuros (gris muy oscuro/azul muy oscuro) pero no negro absoluto.
- Texto principal con alto contraste (blanco o casi blanco).
- Colores de acento que mantengan la identidad de Advenica pero adaptados a modo oscuro (ligeros ajustes de luminosidad para mantener legibilidad).
- Botones, cards, navbar, footer, formularios, etc. deben verse bien en modo oscuro.
Restricciones:
- No cambies la semántica HTML ni la estructura de los componentes salvo que sea estrictamente necesario para el diseño.
- No elimines funcionalidad ni eventos (onClick, enlaces, etc.).
- No introduzcas dependencias pesadas nuevas (como frameworks de UI completos) salvo que lo justifiques y lo pida explícitamente.
Lo que quiero que hagas paso a paso:
1. Analiza brevemente la web https://advenica.com/ (layout, colores, espaciado, tipografía, estilo de botones y cards).
2. Define un pequeño sistema de diseño para mi app en modo oscuro, inspirado en Advenica:
- Variables de color (CSS custom properties o tokens): fondo principal, fondo secundario, color de texto, color de títulos, colores de acento, estados hover/active.
- Tipografía (familia, tamaños base, jerarquía de títulos y párrafos).
- Espaciado base (padding, margin, border-radius).
3. Propón un bloque de código con las variables de diseño en CSS, por ejemplo:
- :root { --color-bg-main: ..., --color-primary: ..., etc. }
4. A partir de ahí, reescribe o ajusta los estilos de:
- body, html, contenedores principales.
- Navbar/cabecera.
- Botones primarios y secundarios.
- Cards / paneles / secciones.
- Formularios (inputs, labels, errores).
- Footer.
5. Asegúrate de:
- Mantener buena accesibilidad (contraste suficiente).
- Que los estados hover, focus y active sean claros en modo oscuro.
- Que el diseño se siga viendo bien en resoluciones altas (2K/4K) usando unidades relativas (rem, %) y no tamaños fijos en px siempre que sea posible.
6. Devuélveme:
- El bloque completo de CSS actualizado/listo para pegar en mi proyecto.
- Si es necesario cambiar algo en componentes concretos (por ejemplo, añadir clases o wrappers), indícalo con ejemplos de código mínimos.
Muy importante:
- Si algo no está claro, explica tus suposiciones en comentarios dentro del código.
- Prioriza la claridad y la mantenibilidad del CSS.
- El resultado final debe “recordar” visualmente a https://advenica.com/, pero adaptado a un modo oscuro moderno y profesional."

  **2º He intentado hacer un prompt más corto y específico pero hace lo que le da la gana, cambia cosas que ni siquiera menciono y no ejecuta bien las especificaciones.**
 "Quiero que actúes como un asistente de diseño y maquetación web especializado en CSS y diseño de interfaces.
Vamos a trabajar sólo en el panel vertical de iniciar nueva tarea operaciones activas.
Quiero que ese panel no esté encerrado, que las tareas y el panel de nueva tarea "floten" en el fondo de la web y se adapten al tamaño de la vetana que esté usandose, estirandose y adaptando la posición de los botones y parámetros para aprovechar el tamaño de las pantallas y ver más cosas en la misma ventana sin necesidad de strollear.
Todo esto con un pequeño margen de unos 77 pixels.
Muy importante:
- No cambies funcionalidades, mantén un código de calidad.
- Si algo no está claro, explica tus suposiciones en comentarios dentro del código.
- Prioriza la claridad y la mantenibilidad del CSS.

  **3º He iniciado un proyecto "Efficient taskflow" en Claude y le he pedido que me genere el prompt base para este proyecto, esta fué la respuesta:**

 "Eres un experto programador senior con más de 20 años de experiencia en desarrollo 
de software y, al mismo tiempo, un profesor de informática apasionado por hacer 
el conocimiento accesible a cualquier persona.

## TU ROL Y MENTALIDAD
- Escribes código como si fuera a ser mantenido por alguien que acaba de aprender 
  a programar, no por ti mismo.
- Cada decisión técnica que tomas tiene una razón, y esa razón siempre está explicada.
- No existe la "pregunta tonta". Toda duda merece una respuesta clara y sin condescendencia.
- Tu código no solo funciona — es legible, predecible y fácil de modificar.

## ESTÁNDARES DE CÓDIGO OBLIGATORIOS

1. COMENTARIOS Y ANOTACIONES
   - Cada función/método debe tener un bloque de documentación que explique:
     · Qué hace (en una línea)
     · Parámetros que recibe (nombre, tipo, para qué sirve)
     · Qué devuelve (tipo y significado)
     · Ejemplo de uso cuando sea útil
   - Comentarios inline para cualquier lógica que no sea obvia a primera vista.
   - Si usas un patrón de diseño, nómbralo y explica brevemente por qué lo elegiste.

2. ESTRUCTURA Y LIMPIEZA
   - Nombres de variables y funciones descriptivos, en el idioma acordado con el usuario.
   - Sin "magic numbers" — toda constante tiene nombre y explicación.
   - Funciones cortas con responsabilidad única (principio SOLID).
   - Separación clara entre lógica de negocio, datos y presentación.

3. GESTIÓN DE ERRORES
   - Nunca dejes un error silencioso. Todo fallo tiene un mensaje claro.
   - Valida entradas al inicio de cada función crítica.
   - Usa bloques try/catch con mensajes de error que expliquen QUÉ falló y POR QUÉ.

4. SEGURIDAD Y BUENAS PRÁCTICAS
   - Nunca hardcodees credenciales, rutas sensibles ni datos de entorno.
   - Señala explícitamente cualquier punto donde el usuario deba configurar 
     variables de entorno o secretos.

## CÓMO PRESENTAS TU TRABAJO
- Antes del código: un párrafo breve explicando el enfoque elegido y por qué.
- Durante el código: comentarios integrados (no separados).
- Después del código:
  · "Cómo probarlo" — pasos concretos para verificar que funciona.
  · "Cómo extenderlo" — 2-3 sugerencias de mejoras naturales.
  · "Posibles errores comunes" — qué puede salir mal y cómo solucionarlo.

## CUANDO ALGO NO ESTÁ CLARO
Antes de escribir código, si la solicitud es ambigua, haz las preguntas mínimas 
necesarias para no tener que reescribir desde cero. Mejor 2 minutos de clarificación 
que 20 de trabajo equivocado.

## IDIOMA Y TONO
- Responde siempre en el idioma en que te hable el usuario.
- Tono: profesional pero cercano. Como un mentor, no como un manual.
- Si detectas un error conceptual en lo que pide el usuario, corrígelo con amabilidad 
  y explica la alternativa correcta antes de implementarla."

  **4º Después le he pedido a Claude mejorar la estética de la app con Tailwind con el siguiente prompt:**
 "He utilizado Trae para intentar diseñar la aplicación con Tailwind imitando la estética de la web: https://advenica.com/ pero no he conseguido buenos resultados.
Intenta mejorar la estética de la web con colores y formas parecidos a https://advenica.com/ y haciendo que el modo oscuro se vea más profesional, parecido al modo oscuro de https://www.twitch.tv/.
Así empezamos con una buena base y luego ir implementando cambios."

Se ha tirado un buen rato analizando lo que he pedido, me ha pasado todos los archivos de la app actualizados con esta respuesta:
 "Los tres cambios principales
styles.css (400 → ~110 líneas)
Solo contiene lo que Tailwind no puede hacer: la textura de rejilla táctica de fondo (líneas azules sutiles a 48px, como un software SIEM/SOC), las animaciones del colapsable, el input dinámico de edición de títulos, el scrollbar personalizado, y el truco más interesante: el selector :has() que colorea el borde izquierdo de cada card según su prioridad (rojo/ámbar/azul).
index.html
Se añaden JetBrains Mono (para etiquetas y badges, con ese carácter de terminal) y Rajdhani (para títulos, condensada y potente). El header tiene ahora un indicador pulsante "SYS ONLINE". Los stats del sidebar usan números grandes con tipografía display. Los filtros de prioridad muestran el color correspondiente al hover.
app.js
Los cambios son solo los strings de clases CSS dentro de addTaskToList() y updateCategoryMenu(). También hay un bugfix de regalo: al editar el título de una tarea completada y guardar, antes perdía el tachado — ahora se restaura correctamente."
  Falla algo basico directamente: que no hay modo normal, sólo modo oscuro. Todo lo demás funciona mejor que antes.

  **5º A continuación he intentado mejorar la app y reparar errores en la misma orden con este prompt:**
  "Funcionalidad: 1º Cambiar el desplegable "iniciar nueva tarea" por una tarea (de ejemplo) tambien desplegable que siempre se quede la última, con este formato de ejemplo: IDENTIFICADOR DE TAREA: Nueva Tarea. ETIQUETAS DE CLASIFICACIÓN: Añade Etiquetas. PLAZO DE EJECUCIÓN: Fecha límite. NIVEL DE PRIORIDAD: Standard.
2º Hacer que la cabecera de la aplicación y el archivo no te sigan el scroll.
3º Colorcar el botón de "archivo" más discreto, en la cabecera de la aplicación.
4º Cambiar el botón de Modo oscuro por un boton ovalado con un circulo que se desplace y mantenga el formato anterior: Si activas modo oscuro queda circulo negro con fondo blanco y si activas modo luz queda circulo gris claro con fondo negro.
5º El modo claro no está configurado o el botón no actúa, solucionalo.
6º No quiero que las tareas tengan un botón de eliminar, cambialó por un botón de archivar y en el archivo: añade un botón de eliminar definitivamente junto con un recuadro para "seleccionar todas"
Formato: Devuélveme el código completo actualizado"

  Esta fué la respuesta:
 Estructuró seis cambios funcionales y planificó la implementación sistemática.

Perfecto. Tengo todo el contexto que necesito. Voy a implementar los 6 cambios de forma limpia y ordenada. Los puntos más delicados son el modo claro (raíz del problema: Tailwind siempre aplica fondo oscuro al body independientemente del tema) y la refactorización del botón de archivo/eliminar.

 Preparó la escritura completa del archivo app.js actualizado.

Aquí tienes los tres archivos actualizados. Resumen de todos los cambios implementados:
Cambio 1 — Nueva tarjeta colapsable (index.html + app.js): el antiguo bloque "INICIAR NUEVA TAREA" se reemplaza por una tarjeta fantasma con aspecto de tarea real (texto en gris/baja opacidad: "Nueva Tarea", "Añade Etiquetas", "Fecha límite", "Standard"). Al hacer clic, el icono + rota 45° y el formulario se despliega debajo. Siempre queda al final de la lista de tareas.
Cambio 2 — Cabecera sin sticky (index.html): eliminados los atributos sticky top-0 z-50. La cabecera ahora forma parte del flujo natural del scroll.
Cambio 3 — Botón archivo en cabecera (index.html): el botón flotante del pie de página ha desaparecido. En su lugar hay un botón discreto en la cabecera (borde suave, texto gris que se ilumina al pasar el ratón) con el contador de archivadas en azul acento.
Cambio 4 — Toggle ovalado (index.html + styles.css): óvalo de 52×28px con círculo deslizante. Modo oscuro → fondo blanco + círculo negro desplazado a la derecha. Modo luz → fondo negro + círculo gris claro a la izquierda. Sin texto, puramente visual.
Cambio 5 — Modo luz funcional (styles.css): el problema raíz era que Tailwind inyecta bg-advenica-black en el <body> vía @layer base y no hay forma de anularlo sin !important. La solución es el selector html:not(.dark) con overrides completos para todos los elementos: fondo azul claro, cards blancas, textos oscuros, inputs con fondo blanco, etc.
Cambio 6 — Archivar en lista / Eliminar en archivo (app.js + index.html): el icono de papelera en las tareas activas se sustituye por un icono de archivo (caja con flechas). Dentro del modal de archivo, cada tarea tiene dos botones: "RESTAURAR" y "ELIMINAR" (rojo, con confirmación). En la parte superior aparece "Seleccionar todas" + "Eliminar seleccionadas" para acciones masivas.

  **El resultado fúe bueno en cuanto a funcionalidad, pero todos los textos se volvieron gigantes y la estética era muy mala.**