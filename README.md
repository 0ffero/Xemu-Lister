### XEMU Compatability List

An interface for checking Xemu compatibility list.

In built image downloader (cache to save hitting xemu.app every time).

Uses directory junction to availableGames. They will be highlighted in the list as available.  
    <ul>The directory junction isn't necessary. You can simply drop all your game folders into the "availableGames" folder.  
    NOTE:  To assign a game as "available", copy it's image from the cache folder to the game folder.  
           Don't worry if you accidentally move the image file, it will be re-downloaded next time Xemu Lister is refreshed.</ul>

Shows games with manuals + manual viewer.

Checks version of local xemu executable.  
    <ul>To check the exe version you need to change the  
    $path = 'D:/EMULATORS/xemu/xemu.exe';  
    in getXemuVersion.php to wherever you've downloaded xemu to</ul>

Checks latest version on xemu.app.

Direct download to newest version.

Link to Vimms Lair (xbox section) for easy downlading of ISO for legally owned games.

Animated GL background taken from xemu.app and rewritten for clarity.

Has search by text, search by letter and search by game status.



    Version 0.1   
                    Create table for JSON data
                    Add a PRE section with instructions on how to create the data
                    Add Search by first letter (including numbers)
                    Add "ALL" option to show all entries

    Version 0.2 
                    Create a ripper to download the images for each title (automatically
                        update the images when needed - ie if any are missing)
                    Optimise all images to reduce file size
    
    Version 0.3
                    Add Search by text input
                    Add search by status buttons
                    Add counts of each status type button (percentage of total)
    
    Version 0.4
                    Add GL background from xemu.app website
    
    Version 0.5
                    Create direct link to Xemu emulator download
                    Write a php script to find the current online version and display it
                        on the page
                    Add link to Vimm's Lair xbox section
    
    Version 0.6
                    Add junction to xbox games folder
                    Write a php script to list the games and output as JSON
                    Copy the chached images for each game into the games folder
                    This allow us to associate the game with the listed version
                    Use this to update the DOM with available games
                    Add "available games" filter button to A-Z

    Version 0.7
                    Update the scrolling of the image container
    
    Version 0.8
                    Create junction to xemu main folder and create a php script to read
                        the version from the exe
                    Display the version next to the title
    
    Version 0.9
                    Add manual icons for available games
                    Create function to add these icons to the available games list
                    Create iframe to display the manual when clicked
                    Add close button for the iframe

    Version 0.99
                    Test for bugs and finalise version number
                    BUG: When downloading images, anything with accents in the game
                        title, were being downloaded multiple times.
                    Added extra check when looking for the current Xemu(.exe) version
                        to make sure the file exists.

    Version 1.0     
                    Everything works as expected : Release version
