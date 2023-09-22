#!/usr/bin/python3
import os
import sys

# get the value of the environment variable 'PATH_PREFIX'
dynamic_url_prefix = os.environ.get('PATH_PREFIX')
print('PATH_PREFIX: ' + str(dynamic_url_prefix))

# if the environment variable 'DYNAMIC_URL_PREFIX' is not set, exit with error
if dynamic_url_prefix is None:
    print('Environment variable PATH_PREFIX not set.')
    sys.exit(1)

# remove the trailing slash from the value of the environment variable 'DYNAMIC_URL_PREFIX'
if dynamic_url_prefix.endswith('/'):
    dynamic_url_prefix = dynamic_url_prefix[:-1]
# remove the leading slash from the value of the environment variable 'DYNAMIC_URL_PREFIX'
if dynamic_url_prefix.startswith('/'):
    dynamic_url_prefix = dynamic_url_prefix[1:]

file_change_counter = 0
react_build_output_dir = 'app/react-build-output'

# check if the directory 'react-build-output' exists and there are files in it
if not os.path.isdir(react_build_output_dir) or len(os.listdir(react_build_output_dir)) == 0:
    print('Directory ' + react_build_output_dir + ' does not exist or is empty.')
    sys.exit(1)

# search for all files in the directory 'react-build-output'
for root, dirs, files in os.walk('app/react-build-output'):
    for file in files:
        # open the file
        with open(os.path.join(root, file), 'r') as f:
            # skipt files with the extension '.ico' or '.png' or '.jpg' or '.jpeg' or '.svg' or '.gif'
            if file.endswith('.ico') or file.endswith('.png') or file.endswith('.jpg') or file.endswith('.jpeg') or file.endswith('.svg') or file.endswith('.gif'):
                continue
            # read the content of the file
            try:
                content = f.read()
            except UnicodeDecodeError:
                print('UnicodeDecodeError: Unable to read file ' + os.path.join(root, file))
                sys.exit(1)
            # replace the string '_DYNAMIC_URL_PREFIX_PLACEHOLDER_' with the value of the environment variable 'DYNAMIC_URL_PREFIX'
            url_occurrence_count = content.count('_DYNAMIC_URL_PREFIX_PLACEHOLDER_')
            if url_occurrence_count > 0:
                content = content.replace('_DYNAMIC_URL_PREFIX_PLACEHOLDER_', dynamic_url_prefix)
            # close the file
            f.close()
        if url_occurrence_count > 0:
            # open the file
            with open(os.path.join(root, file), 'w') as f:
                # write the content of the file
                f.write(content)
                # close the file
                f.close()
                file_change_counter += 1

print('Finished replacing url placeholder with ' + dynamic_url_prefix + ' in ' + str(file_change_counter) + ' files.')