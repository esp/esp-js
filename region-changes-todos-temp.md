# Misc TODO

[x] make sure displayOptions is renamed to regionItemOptions everywhere
[x] check `RegionItemRecord.updateWithModel`, should I use that to update the tag?
    [x] Yes, use this
    [x] This should be called from teh RegionManager, and that should call every region with the item so it's state changed call be called.
[x] Add RegionManager.setSelected()
[ ] Add or update tests for the various `existsInRegion` overloads on both region and region manager
[ ] removeFromRegion should also take regionRecordId

# Refactors 

The region manager API has too many ways to interact with it:
    regionItemRecord
    regionItem
    modelId
    recordId
This has been update so if you need the recordId, you need to pass a `RegionItem`. 
`modelId` is now more consistently applied. 

# Breaking Changes 

[ ] These deprecated items have been removed
    [x] `RegionModelBase`
    [x] RegionBase.addRegionItem
    [x] RegionBase.removeRegionItem
    [x] addToRegion(regionName: string, modelId:string, regionItemOptions: RegionItemOptions)
[ ] addToRegion no longer returns a RegionItem.
[ ] These now use modelId, not recordId: 
    [ ] existsInRegion 
    [ ] addToRegion 
    [ ] removeFromRegion 

[ ] Check if blade is using any regionRecords when interaction with region manager or regions, these are now model ID

# Tests Required for RegionManager

registerRegion can register

registerRegion throws if region already registered

getRegions returns regions

getRegion returns region

getRegion throws if region missing

unregisterRegion removes region

loadRegion throws if region not registered

loadRegion loads region (full test in RegionBase)

addToRegion can add by model id

addToRegion can add by RegionItem

addToRegion can add via event 

setSelected sets region item as selected in associated Region

updateRegionItem updates RegionItemOptions

removeFromRegion by modelId removes from region

removeFromRegion by RegionItem removes from region

removeFromAllRegions by RegionItem removes from all regions

existsInRegion finds item in region

# Tests Required for RegionBase

observeEvents registers region with RegionManager
dispose de-registers region with RegionManager
guard interactions when observeEvents isn't called (can perhaps use isOnDispatchLoop override which also checks we're wired up)

addToRegion by RegionItem adds item 
addToRegion by model id adds item
addToRegion throws if you attempt to re-add item
addToRegion raises onStateChanged
addToRegion listens for model load if model not yet created

existsInRegion by RegionItemRecord selects item  
existsInRegion by RegionItem selects item  RegionItem
existsInRegion by model id selects item
existsInRegion by predicate  

setSelected by RegionItemRecord selects item  
setSelected by RegionItem selects item  RegionItem 
setSelected by model id selects item 
setSelected by model id can set multiple selections  
setSelected by event selects item
setSelected raises onStateChanged

updateRegionItem by RegionItemRecord selects item  
updateRegionItem by RegionItem selects item  RegionItem
updateRegionItem by model id selects item
updateRegionItem by model id can set multiple selections  
updateRegionItem raises onStateChanged

updateRegionItem with RegionItem updates RegionItemOptions
updateRegionItem with modelId & options updates RegionItemOptions
updateRegionItem with modelId updates all relevant region items 
updateRegionItem calls onStateChanged

removeFromRegion can remove first by model id
removeFromRegion can remove by RegionItem
removeFromRegion raises onStateChanged

getRegionState returns all state

load loads all valid region items
load skips views where view factory not registered
load listens for model load if model not yet created

unload unloads all views
unload disposes all views
unload deselects selections
unload raises onStateChanged

# ModelBase tests

Throw if ensureOnDispatchLoop called when observeEvents hasn't been called
