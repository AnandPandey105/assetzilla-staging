
import os
import pathlib
import shutil
from PIL import Image

# im = Image.open
# assign directory
print ("Welcome")
directory = 'assets'
print("directory: ", directory)
 
# iterate over files in
# that directory
for root, dirs, files in os.walk(directory):
    for filename in files:
        file_name = os.path.join(root, filename)
        extension = pathlib.Path(file_name).suffix
        filename_without_extension = "".join(file_name.split(".")[:-1])
        new_dir_path = "new/"+root
        print('==========================')
        print(f"File Name: {file_name}")

        if not os.path.exists(new_dir_path):
            os.makedirs(new_dir_path)
        if extension in ['webp', '.png', '.jpeg']:
            im = Image.open(file_name)
            new_file_name = 'new/' + filename_without_extension + ".webp"
            im.save(new_file_name, "webp")
            print(f"File Created!")
            print(f"New File Name: {new_file_name}")
        else:
            print(f"File Moved!")
            shutil.copy(file_name, os.path.join(new_dir_path, filename))
            