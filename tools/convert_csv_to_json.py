
import csv
import json
import os

def convert_csv_to_json():
    """
    Reads the master SKU list from a CSV file and converts it into a
    structured JSON format required by the 3D racking configurator application.
    """
    # Get the directory of the current script to build a relative path
    script_dir = os.path.dirname(os.path.realpath(__file__))
    # Go one level up to the project root, then into public/data
    csv_file_path = os.path.join(script_dir, '../public/data/master_sku_list.csv')
    json_file_path = os.path.join(script_dir, '../public/data/data.json')

    data = {
        "pipes": {},
        "fittings": {}
    }

    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)

            for row in csv_reader:
                sku = row["sku"].strip()
                product_type = row["product_type"].strip()
                
                # Process Pipe data
                if product_type == "Pipe":
                    # e.g., PIP-A-G
                    size_code = sku.split('-')[1]
                    diameter_str = row["description"].split("mm")[0].split("(")[-1].strip()
                    
                    data["pipes"][diameter_str] = {
                        "sku": sku,
                        "name": row["product_name"].strip(),
                        "description": row["description"].strip(),
                        "size_code": size_code,
                        "nominal_size_mm": float(diameter_str),
                        # Assuming wall thickness needs to be added or is constant
                        "wall_thickness_mm": 2.5, # Example value, adjust if available
                        "price_per_meter": float(row["price"]) * 1000, # convert price/mm to price/m
                    }

                # Process Fitting data
                elif product_type == "Fitting":
                    # e.g., FIT-A-116
                    sku_parts = sku.split('-')
                    size_code = sku_parts[1]
                    fitting_id = sku_parts[2]

                    # If this is the first time seeing this fitting_id, create its entry
                    if fitting_id not in data["fittings"]:
                        data["fittings"][fitting_id] = {
                            "name": row["product_name"].strip(),
                            "description": row["description"].strip(),
                            "pdf_drawing": f"/assets/drawings/T{fitting_id}.pdf", # Assumed path
                            "sizes": {}
                        }
                    
                    # Add the size-specific variant information
                    data["fittings"][fitting_id]["sizes"][size_code] = {
                        "sku": sku,
                        "price": float(row["price"])
                    }

        # Write the structured data to the JSON file
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=4)

        print(f"Successfully converted {csv_file_path} to {json_file_path}")

    except FileNotFoundError:
        print(f"Error: The file {csv_file_path} was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    convert_csv_to_json()
