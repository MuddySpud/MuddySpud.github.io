
************* Before a release to live delete git *******************

## Publish to DocsAssemblerDemo

Publish C:\GitHub\MuddySpud\MuddySpud.github.io\tsmaps\Ξ DocumentationHell\DocumentationHell.tsmap

Then copy over published files to docs.

Run yarn build

Delete all files in C:\GitHub\MuddySpud\MuddySpud.github.io\docs\assets\FragmentRenderer

Copy over the files in C:\GitHub\MuddySpud\MuddySpud.github.io\build over to C:\GitHub\MuddySpud\MuddySpud.github.io\docs\assets\FragmentRenderer

Adjust these references in C:\GitHub\MuddySpud\MuddySpud.github.io\docs\_includes\head.html
  <script type="module" crossorigin src="/assets/FragmentRenderer/index.Df81YTG1.js"></script>
  <link rel="modulepreload" crossorigin href="/assets/FragmentRenderer/stepHook.BZRxKY32.js">
  <link rel="modulepreload" crossorigin href="/assets/FragmentRenderer/guide.BXLPv0P3.js">
  <link rel="stylesheet" crossorigin href="/assets/FragmentRenderer/guide.CqGWZ4gS.css">
to the new file names in C:\GitHub\MuddySpud\MuddySpud.github.io\docs\assets\FragmentRenderer

Delete these folders in DocsAssemblerDemo:
  C:\GitHub\DocsAssemblerDemo\tsmaps
  C:\GitHub\DocsAssemblerDemo\docs\_includes
  C:\GitHub\MuddySpud\MuddySpud.github.io\docs\_layouts
  C:\GitHub\DocsAssemblerDemo\docs\assets
  C:\GitHub\DocsAssemblerDemo\docs\DocumentationHell_frags
  C:\GitHub\DocsAssemblerDemo\docs\LuSenlinTech
  C:\GitHub\DocsAssemblerDemo\docs\Technical
  C:\GitHub\DocsAssemblerDemo\docs\DocumentationHell.md

copy over folders:
C:\GitHub\MuddySpud\MuddySpud.github.io\tsmaps to C:\GitHub\DocsAssemblerDemo\tsmaps
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\DocumentationHell.md to C:\GitHub\DocsAssemblerDemo\docs\DocumentationHell.md
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\Technical to C:\GitHub\DocsAssemblerDemo\docs\Technical
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\LuSenlinTech to C:\GitHub\DocsAssemblerDemo\docs\LuSenlinTech
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\DocumentationHell_frags to C:\GitHub\DocsAssemblerDemo\docs\DocumentationHell_frags
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\assets to C:\GitHub\DocsAssemblerDemo\docs\assets
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\_includes to C:\GitHub\DocsAssemblerDemo\docs\_includes
C:\GitHub\MuddySpud\MuddySpud.github.io\docs\_layouts to C:\GitHub\DocsAssemblerDemo\docs\_layouts

Copy over the fragment json and markdwn from C:\GitHub\DocsAssemblerDemo\docs\DocumentationHell.md
to C:\GitHub\DocsAssemblerDemo\docs\index.md

Commit the changes and check github CompositeFlows-RM

https://docsassemblerdemo.netoftrees.com/


###### Next:

  Need to always make sure start with title that matches previous selected option. ie option selected must be followed by a markdown heading with the same text as option.
  Build other locations.
  Add todo for farm field should pretend that it is LuSenlin that is saying it. ie contact field division as this location is being developed.
  Then try and generate images for frames and modules with plants added.
  As Adrian said with his image.

Add what to notice in intro to demo.
  - See how large the range of opions are
  - How similar but slghtly different - so we remove duplication so we only have to edit in a single place. etc
  - How we can edit a small sctin on in isolation no having to be overwhelmed with the whole guide.
  - Using variables to define column text can make a defining a table in markdown easier to read and debug
  - Don't need to follow this for building your docs it is just a demo of what is possible
  - why don't you experiment...
  - The architexture choices we made in this demo are for demonstration purposes only.

#### Tech path
Need to have some way for the technical exploration of demo to include when in the chain it is linking to a new tree perhaps show a screen shot of the map with that step highlighed and open in the markdown editor.

#### Spaces - write text differences
Need to write out the differences between spaces ie garden could have a shelter and different anchors - need the get Deepseek to work that out for each space what are their differnces based on what it knows.
Then need to script out a rough path and ask Deepseek to critique it. What text to edit, add or remove.

#### - Spaces field special treatment
Ask DS to script out text to say that the field needs special treatment and to give us a call - ask deepseek what it thinks...
Need a technical summary for the techncal path.

### Need to get a version out now
