import random
import bisect

# Define your list of attributes with associated rarity weights
# Higher numbers mean the attribute is more common.
attributes = {
    'hat': [
        ('trucker anime', 50),  # Common
        ('maid hat', 30),   # Uncommon
        ('trucker im soo', 15),  # Rare
        ('plaid bonnet', 4),    # Epic
        ('pink bonnet', 1),   # Legendary
        ('backwards trucker pink', 1),   # Legendary
        ('blue pink bow', 1),   # Legendary
        ('shy saints cap', 1),   # Legendary
        ('trucker construction', 1),   # Legendary
        ('cake hat', 1),   # Legendary
        ('aloha visor', 1),   # Legendary
        ('dubai hat', 1),   # Legendary
        ('orange beret', 1),   # Legendary
        ('fez', 1),   # Legendary
        ('white cowboy', 1),   # Legendary
        ('strawberry', 1),   # Legendary
        ('cake', 1),   # Legendary
        ('alien hat', 1),   # Legendary
        ('halo', 1),   # Legendary
    ],
    'glasses': [
        ('round', 50),  # Common
        ('prescription', 30),   # Uncommon
        ('sunglasses', 15),  # Rare
        ('harajuku', 4),    # Epic
        ('oakleys', 1),   # Legendary
    ],
    'necklace': [
        ('milady beads', 50),  # Common
        ('pearl necklace', 30),   # Uncommon
        ('cherry necklace', 4),    # Epic
        ('smiley bead necklace', 1),   # Legendary
        ('fliphone lanyard', 1),   # Legendary
        ('evil eye necklace', 1),   # Legendary
        ('ethereum necklace', 1),   # Legendary
        ('lean neck tattoo', 1),   # Legendary
        ('spider neck tattoo', 1),   # Legendary
        ('castle neck tattoo', 1),   # Legendary
    ],
    'race': [
        ('pale', 30),  # Common
        ('clay', 30),   # Uncommon
        ('pink', 25),  # Rare
        ('tan', 10),    # Epic
        ('black', 3),   # Legendary
        ('alien', 2),   # Legendary
    ],
        'hair_color': [
        ('dark', 50),  # Common
        ('brown', 30),  # Uncommon
        ('green', 15), # Rare
        ('slate', 4),     # Epic
        ('pink', 1),    # Legendary
        ('blonde', 1),    # Legendary
        ('orange', 1),    # Legendary
        ('blue', 1),    # Legendary
        ('harajuku', 1),    # Legendary
    ],
    'hair_style': [
        ('long', 50),  # Common
        ('short', 30),   # Uncommon
        ('bun', 15),  # Rare
        ('bald', 4),    # Epic
        ('mohawk', 1),   # Legendary
    ],
    'face_decoration': [
        ('none', 50),  # Common
        ('teardrops tattoo', 30),   # Uncommon
        ('star heart tattoo', 15),  # Rare
        ('gray', 4),    # Epic
        ('face piercings', 1),   # Legendary
        ('temple cross tattoo', 1),   # Legendary
        ('black hearts tattoo', 1),   # Legendary
        ('milady pilled tattoo', 1),   # Legendary
        ('crescent tattoo', 1),   # Legendary
        ('tyson tribal tattoo', 1),   # Legendary
        ('gucci cone tattoo', 1),   # Legendary
    ],
    'eyes': [
        ('sparkle', 50),  # Common
        ('classic', 30),   # Uncommon
        ('dilated', 15),  # Rare
        ('teary', 4),    # Epic
        ('sleepy', 1),   # Legendary
        ('closed', 1),   # Legendary
        ('crying', 1),   # Legendary
        ('smug', 1),   # Legendary
        ('spiral', 1),   # Legendary
        ('heart eyes', 1),   # Legendary
    ],
    'eye_color': [
        ('green', 50),  # Common
        ('blue', 30),   # Uncommon
        ('brown', 15),  # Rare
        ('aqua', 4),    # Epic
        ('lilac', 1),   # Legendary
        ('grey', 1),   # Legendary
        ('leaf', 1),   # Legendary
        ('gold', 1),   # Legendary
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
seed = 12345  # This is your random seed
attributes_with_rarity = generate_attributes_with_rarity(seed)
print(f"Seed: {seed}, Attributes: {attributes_with_rarity}")