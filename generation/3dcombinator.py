import bpy
import os
import math

current_dir = "/Users/prnth/Documents/GitHub/moviemaker/generation/"
print("Current Directory:", current_dir)

# Load the base model
model_path = os.path.join(current_dir, 'model.fbx')
print(model_path)
bpy.ops.import_scene.fbx(filepath=model_path)

json = {'hat': 'none', 'glasses': 'sunglasses', 'hair_style': 'short', 'necklace': 'none', 'shirt': 'Maf Rothko', 'race': 'clay', 'hair_color': 'slate', 'face': 'star heart tattoo', 'eye_color': 'green', 'hidden': 'none'}

def match_transformations(obj, target_obj):
    print(obj)
    rotation_x = 90  # Rotate 45 degrees around X-axis
    # Convert degrees to radians
    rotation_x_rad = math.radians(rotation_x)
    obj.rotation_mode = 'XYZ'
    # Apply the rotations to the object
    obj.rotation_euler = (rotation_x_rad, rotation_x_rad, rotation_x_rad)
    # Match the location, rotation, and scale of the target object
    obj.location = target_obj.location
    obj.scale = (10, 10, 10)   # target_obj.scale
    
# Function to attach a helmet/hair to the head bone
def attach_to_head(obj_name, head_bone):
    obj = bpy.data.objects[obj_name]
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    # Apply rotation and scale transformations
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)
    armature = bpy.data.objects['Armature']  # Replace with your armature's name
    obj.parent = armature
    obj.parent_type = 'BONE'
    obj.parent_bone = head_bone
    match_transformations(obj, armature)

# Replace the image texture of the 'Skin' material
def replace_skin_texture(new_image_path):
    # Iterate over all materials
    for mat in bpy.data.materials:
        if mat.name == 'Skin' and mat.node_tree:
            for node in mat.node_tree.nodes:
                # Find the image texture node
                if node.type == 'TEX_IMAGE':
                    # Replace the image
                    node.image = bpy.data.images.load(new_image_path)
                    break


# Import a helmet/hair model and attach it
glb_file_path = f"{current_dir}props/headgear_{json['glasses'].replace(' ', '_')}.glb"
bpy.ops.import_scene.gltf(filepath=glb_file_path)

attach_to_head("Sketchfab_model", 'mixamorig:Head')

#if helmet:
    # Select the helmet
#    bpy.context.view_layer.objects.active = helmet
#    helmet.select_set(True)

    # Apply rotation and scale transformations
#    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Attach the helmet to the head bone
#    attach_to_head(helmet.name, 'mixamorig:Head')  # Replace 'HeadBoneName' with your bone name


# Call the function with the path to the new image
new_image_path = os.path.join(current_dir, 'output/1.png')
replace_skin_texture(new_image_path)

# Export the combined model
output_model_path = os.path.join(current_dir, 'output_model.fbx')
bpy.ops.export_scene.fbx(
    filepath=output_model_path,
    path_mode='COPY',  # Copy all external files into the destination directory
    embed_textures=True,  # Embed textures in the FBX binary file
    bake_space_transform=False 
)