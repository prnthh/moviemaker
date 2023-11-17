import random
import bisect
import os

seedOffset = 0
# Define your list of attributes with associated rarity weights
# Higher numbers mean the attribute is more common.
attributes = {
    'hat': [
        ('none', 40), 
        ('trucker anime', 50),  # done
        ('maid hat', 30),   # done
        ('trucker im soo', 15),  # done
        ('plaid bonnet', 2), 
        ('pink bonnet', 2),   
        ('backwards trucker pink', 2), # done  
        ('blue pink bow', 2),   
        ('shy saints cap', 2),   
        ('trucker construction', 2),   
        ('cake hat', 2),   
        ('911 hat', 2),   
        ('rice farmer hat', 2),   
        ('aloha visor', 2),  
        ('dubai hat', 2),   # done
        ('orange beret', 2), 
        ('fez', 2),   # done
        ('white cowboy', 2),   
        ('brown cowboy', 2),   # done
        ('strawberry', 2),   
        ('cake', 2), 
        ('alien hat', 2),   
        ('halo', 2),   
    ],
    'glasses': [
        ('none', 50),
        ('round', 5),  # Common
        ('prescription', 5),   # Uncommon
        ('sunglasses', 5),  # Rare
        ('harajuku', 5),    # Epic
        ('dealwithit', 5),    # Epic
        ('pitvipers', 5),   # Legendary
    ],
    'hair_style': [
        ('long', 50),  # Common
        ('short', 30),   # Uncommon
        ('bun', 15),  # Rare
        ('bald', 4),    # Epic
        ('mohawk', 1),   # Legendary
    ],

    # texture traits

    'necklace': [
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
     'shirt': [
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
    'face': [
        ('none', 50),
        ('teardrops tattoo', 30),
        ('star heart tattoo', 15),
        ('gray', 4),    # Epic
        ('face piercings', 1),   # Legendary
        ('temple cross tattoo', 1),  
        ('black hearts tattoo', 1),
        ('milady pilled tattoo', 1), 
        ('crescent tattoo', 1), 
        ('tyson tribal tattoo', 1),  
        ('gucci cone tattoo', 1), 
    ],
    'eye_color': [
        ('green', 30),  # Common
        ('blue', 30),   # Uncommon
        ('brown', 25),  # Rare
        ('aqua', 5),    # Epic
        ('lilac', 5),   # Legendary
        ('grey', 2),   # Legendary
        ('leaf', 2),   # Legendary
        ('gold', 1),   # Legendary
    ],
    'hidden': [
        ('none', 50),  # Common
        ('nose blush', 30),   # Uncommon
        ('cheek blush', 15),  # Rare
        ('smoking', 4),    # Epic
        ('glasses', 1),   # Legendary
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
    return selected_attributes

# Example usage
seed = seedOffset + 1  # This is your random seed
attributes_with_rarity = generate_attributes_with_rarity(seed)
print(f"Seed: {seed}, ")
print(attributes_with_rarity)


# Generate the texture from layers using ImageMagick 

metadata = attributes_with_rarity

# Base image - start with a blank canvas or a base layer
command = "convert -size 1024x1024 canvas:none "

# Add each layer based on metadata
for key, value in metadata.items():
    if value != 'none':
        layer_file_name = f"image-assets/{key}_{value.replace(' ', '_')}.png"
        if os.path.exists(layer_file_name):  # Check if the layer file exists
            command += f"{layer_file_name} -composite "
        else:
            print(f"Warning: Layer file not found: {layer_file_name}")

# Final output file
command += f"output/{seed}.png"

# Execute the command
os.system(command)