import random
import bisect
import os
import json
import json
seedOffset = 11
# Define your list of attributes with associated rarity weights
# Higher numbers mean the attribute is more common.
attributes = {
    'hat': [
        ('none', 70), 
        ('trucker anime', 5),  # done
        ('maid', 5),   # done
        ('trucker im sooo', 5),  # done
        ('backwards trucker pink', 5), # done     
        ('shy saints', 5), # done   
        ('dubai', 5),   # done
        ('koss portapros', 5), # done
        ('fez', 5),   # done
        ('white cowboy', 3),   # done
        ('brown cowboy', 3),   # done
        ('911', 5), # done
        ('rice farmer', 5), # done
        ('aloha visor', 5), # done
        ('strawberry', 5), # done
        ('flower_clip', 5), # done
        ('cat ears', 5), # done
        # ('trucker construction', 2),   
        # ('orange beret', 2), 
        ('blue pink bow', 5), # done
        # ('plaid bonnet', 2), 
        # ('pink bonnet', 2), 
        ('cake', 2), # done
        ('alien hat', 2), # done
        ('halo', 2),   # done 
    ],
    'glasses': [
        ('none', 50),
        ('round', 5),
        ('round2', 5),
        ('block', 5),
        ('clout goggles', 5), 
        ('aviators', 5),
        ('prescription', 5),
        ('sunglasses', 5),
        ('harajuku', 5),
        ('dealwithit', 5),
        ('pitvipers', 5),
    ],
    'mouth': [
        ('1', 5),
        ('2', 5),
        ('3', 5),
        ('4', 5),
        ('5', 5), 
        ('6', 5),
        ('7', 5),
        ('8', 5),
        ('9', 5),
    ],
    'hair_style': [
        ('tuft', 50),
        ('braids', 30), 
        ('short', 5),
        ('bald', 5),
    ],

    # texture traits
     'shirt': [
        ('Green Blazer', 5),  
        ('Black Blazer', 5),  
        ('Mouse', 5),  
        ('Blue Ribbon', 5),  
        ('Football', 5),  
        ('Goth Harajuku', 5),  
        ('Hikki Condition', 5),  
        ('Skull Sweater', 5),  
        ('MWO', 5),  
        ('Im Cute Im Punk', 5),  
        ('Maf Rothko', 5),  
        ('Maf Creeper', 5),  
        ('Heihei', 5),  
        ('Meline Teddy', 5),  
        ('Active Dissident', 5),  
        ('Cactus', 5),  
        ('Super Lover', 5),  
        ('Special People', 5),  
        ('Bear', 5),  
        ('Sweater And Tie', 5),  
    ],
    'skirt': [
        ('1', 5),
        ('2', 5),
        ('3', 5),
        ('4', 5),
        ('5', 5),
        ('6', 5),
        ('7', 5),
        ('8', 5),
    ],
    'race': [
        ('pale', 30),  
        ('clay', 30),   
        ('pink', 25),  
        ('tan', 10),   
        ('black', 3),  
        ('alien', 2),  
    ],
    'hair_color': [
        ('dark', 30), 
        ('brown', 15),  
        ('green', 15), 
        ('slate', 15),   
        ('blonde', 5),   
        ('pink', 5),   
        ('orange', 5),  
        ('blue', 5),   
        ('harajuku', 5), 
    ],
    'neck': [
        ('none', 40),
        ('milady beads', 5),
        ('pearl necklace', 5),
        ('coral cross necklace', 5),
        ('girl necklace', 5),
        ('cherry necklace', 5),
        ('smiley bead necklace', 5),
        ('fliphone lanyard', 5),
        ('evil eye necklace', 5),
        ('ethereum necklace', 5),
        ('lean neck tattoo', 5),
        ('spider neck tattoo', 5),
        ('castle neck tattoo', 5),
    ],
    'face': [
        ('none', 30),
        ('nose blush', 10),   # Uncommon
        ('cheek blush', 10),  # Rare
        ('blush', 10),  # Rare
        ('teardrops tattoo', 5),
        ('temple cross tattoo', 5),  
        ('black hearts tattoo', 5),
        ('milady pilled tattoo', 5), 
        ('crescent tattoo', 5), 
        ('tyson tribal tattoo', 5),  
        ('gucci cone tattoo', 5), 
    ],
    'eye_color': [
        ('green', 30), 
        ('blue', 30),  
        ('brown', 25), 
        ('aqua', 5),  
        ('lilac', 5), 
        ('grey', 2), 
        ('leaf', 2),
        ('gold', 1),
    ],
    'mouth': [
        ('1', 1),
        ('2', 1),
        ('3', 1),
        ('4', 1),
        ('5', 1),
        ('6', 1),
        ('7', 1),
        ('8', 1),
        ('9', 1),
    ],
    'background': [
        ('xp', 5),
        ('train', 5),
        ('sega', 5),
        ('tennis', 5),
        ('vitruvian', 5),
        ('nagano', 5),
        ('casino', 5),
        ('yashima', 5),
        ('streets', 5),
        ('sonora', 5),
        ('mountain', 5),
    ],
}

# Function to generate weighted random choice
def weighted_random_choice(choices):
    values, weights = zip(*choices)
    total = 0
    cumulative_weights = []
    for w in weights:
        total += w
        cumulative_weights.append(total)
    x = random.random() * total
    i = bisect.bisect(cumulative_weights, x)
    return values[i]

# Function to generate attributes based on rarity
def generate_attributes_with_rarity(seed):
    random.seed(seed)
    selected_attributes = {}
    for attribute, choices in attributes.items():
        selected_attributes[attribute] = weighted_random_choice(choices)

    if selected_attributes['race'] == 'alien':
        selected_attributes['eye_color'] = 'alien'
    return selected_attributes

def generate_texture(attributes_with_rarity):
    metadata = attributes_with_rarity
    # Base image - start with a blank canvas or a base layer
    command = "convert -size 1024x1024 canvas:none "
    # Add each layer based on metadata
    for key, value in metadata.items():
        if value != 'none' and key != 'hat' and key != 'glasses' and key != 'hair_style' and key != 'mouth' and key != 'background':
            layer_file_name = f"image-assets/{key}_{value.replace(' ', '_')}.png"
            if os.path.exists(layer_file_name):  # Check if the layer file exists
                command += f"{layer_file_name} -composite "
            else:
                print(f"Warning: Layer file not found: {layer_file_name}")
    # Final output file
    command += f"output/{seed}.png"
    # Execute the command
    os.system(command)

def write_metadata_as_json(attributes_with_rarity, seed):
    metadata = attributes_with_rarity
    # Write metadata to file, overwriting existing file
    with open(f"output/{seed}.json", "w") as outfile:
        json.dump(metadata, outfile, indent=4)

def write_metadata_as_file(attributes_with_rarity, seed):
    metadata = {}
    # delete attributes_with_rarity 'mouth'
    del attributes_with_rarity['mouth']
    del attributes_with_rarity['skirt']
    
    traits = [{'trait_type': key, 'value': value} for key, value in attributes_with_rarity.items()]

    metadata['name'] = f"Milady Pockit #{seed}"
    metadata["description"] = "Pockit is a collection of 3333 on-chain interactive pocket companion toys. Each Pockit comes with a downloadable VRM avatar inspired by Milady Maker."
    # metadata["image"] = "ipfs://QmSFGKuCsZEPzEEuPUGHyuc1YMsqi4jJdgKkDhyxgu1AHS/399.gif",
    metadata["animation_url"] = f"https://prnth.com/Pockit/web/{seed}.html"
    metadata["attributes"] = traits
    with open(f"upload/{seed}", "w") as outfile:
        json.dump(metadata, outfile, indent=4)

def copy_html(seed):
    if seed != 1:
        os.system(f"cp web/1.html web/{seed}.html")

# Example usage
startrange = 1
intervalsize = 3333

for seed in range(startrange, startrange + intervalsize):
    attributes_with_rarity = generate_attributes_with_rarity(seedOffset + seed * 3)
    # write_metadata_as_json(attributes_with_rarity, seed)
    # generate_texture(attributes_with_rarity)
    # write_metadata_as_file(attributes_with_rarity, seed)
    # copy_html(seed)