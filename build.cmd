@echo off
REM First argument set config_?.js file.
if "%1" == "" (
    echo Please provide a config file.
) else (
echo Make javascript...

java -jar "C:\closure compiler\compiler.jar" ^
--js %1 ^
--js .\js\client.js ^
--js .\js\models\user.js --js .\js\models\conversation.js --js .\js\models\roster.js ^
--js .\js\controllers\conversation.js ^
--js .\js\views\playlist.js ^
--js .\js\app.js ^
--js_output_file .\js\chatify.min.js

echo ...done!

REM copy files to output dir
robocopy .\js\ .\build\js\ chatify.min.js
robocopy .\css\ .\build\css\ *
robocopy .\img\ .\build\img\ *
robocopy .\js\libs\ .\build\js\libs\ *
robocopy .\ .\build\ index.html
robocopy .\ .\build favicon.ico

echo ------------------------------------
echo Change Script includes in index.html!
)
