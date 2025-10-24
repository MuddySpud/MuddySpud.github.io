
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


Fix tehnical ancillaries


An RFID seed pad is a pre-formed **seed cartridge that has a tiny RFID (radio-frequency identification) tag laminated into, or printed onto, the pad itself**.

