<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nestly - Gestión del Hogar</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-emerald-50 min-h-screen">
    <div id="app" class="min-h-screen w-full">
        <noscript>
            <div class="p-8 text-center">Necesitas Javascript activado para ver la aplicación React.</div>
        </noscript>
        <!-- Debug: fallback element for testing -->
        <div id="app-debug" class="p-8 text-center text-slate-700">React debería montarse aquí.</div>
    </div>
</body>
</html>
